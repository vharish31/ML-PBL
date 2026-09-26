"""
Smart Energy Consumption Forecasting System
Model Training & Evaluation Pipeline
Machine Learning Energy Intelligence Platform

Target: Appliances (Watt-hours)
Dataset: KAG_energydata_complete.csv (19,735 records, 10-minute intervals)
"""

import os
import json
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.model_selection import TimeSeriesSplit
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

# Optional gradient boosted libraries
try:
    import xgboost as xgb
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

try:
    import lightgbm as lgb
    HAS_LGB = True
except ImportError:
    HAS_LGB = False


# 1. Pipeline Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(os.path.dirname(BASE_DIR), 'dataset')
OUTPUTS_DIR = os.path.join(os.path.dirname(BASE_DIR), 'outputs')
os.makedirs(OUTPUTS_DIR, exist_ok=True)
os.makedirs(BASE_DIR, exist_ok=True)


def load_and_preprocess_data(file_path: str) -> pd.DataFrame:
    """
    Loads dataset, parses chronological date, handles missing records,
    and extracts temporal cyclic features.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset not found at: {file_path}")

    print(f"[*] Loading raw dataset from: {file_path}")
    df = pd.read_csv(file_path)

    # 1. Parse date and sort chronologically (vital for time-series forecasting)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values(by='date').reset_index(drop=True)

    print(f"[*] Total records: {len(df):,}, Columns: {len(df.columns)}")
    print(f"[*] Date range: {df['date'].min()} to {df['date'].max()}")

    # 2. Datetime feature engineering
    df['hour'] = df['date'].dt.hour
    df['minute'] = df['date'].dt.minute
    df['day_of_week'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month
    df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)

    # Cyclic hour transformations to preserve 23:00 -> 00:00 continuity
    df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24.0)
    df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24.0)

    return df


def prepare_features(df: pd.DataFrame):
    """
    Splits features and target. Excludes non-predictive timestamps.
    """
    target_col = 'Appliances'

    feature_cols = [
        'lights',
        'T1', 'RH_1', 'T2', 'RH_2', 'T3', 'RH_3',
        'T4', 'RH_4', 'T5', 'RH_5', 'T6', 'RH_6',
        'T7', 'RH_7', 'T8', 'RH_8', 'T9', 'RH_9',
        'T_out', 'Press_mm_hg', 'RH_out', 'Windspeed', 'Visibility', 'Tdewpoint',
        'rv1', 'rv2',
        'hour', 'day_of_week', 'month', 'is_weekend', 'hour_sin', 'hour_cos'
    ]

    # Ensure all feature columns exist in dataset
    available_features = [c for c in feature_cols if c in df.columns]

    X = df[available_features]
    y = df[target_col]

    return X, y, available_features


def evaluate_model(name: str, y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    """
    Calculates standard regression metrics: MAE, MSE, RMSE, R².
    Explicitly explains R² as proportion of variance explained vs baseline.
    """
    mae = float(mean_absolute_error(y_true, y_pred))
    mse = float(mean_squared_error(y_true, y_pred))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_true, y_pred))

    return {
        'model': name,
        'MAE': round(mae, 4),
        'MSE': round(mse, 4),
        'RMSE': round(rmse, 4),
        'R2': round(r2, 4),
        'interpretation': f"An R2 of {r2:.4f} means {r2 * 100:.2f}% of target variance is explained by {name} on holdout set."
    }


def train_and_compare_models(X_train, y_train, X_test, y_test, feature_names):
    """
    Trains and benchmarks Random Forest, XGBoost, LightGBM, and an Ensemble.
    Uses chronological holdout test set to prevent future data leakage.
    """
    results = {}
    trained_models = {}

    # 1. Random Forest Regressor (Current Baseline)
    print("\n[*] Training Random Forest Regressor (Baseline)...")
    rf = RandomForestRegressor(
        n_estimators=200,
        max_depth=22,
        min_samples_split=4,
        min_samples_leaf=2,
        max_features='sqrt',
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)
    rf_preds = rf.predict(X_test)
    results['RandomForest'] = evaluate_model("Random Forest (Baseline)", y_test, rf_preds)
    trained_models['rf'] = rf

    # 2. XGBoost Regressor (Candidate)
    if HAS_XGB:
        print("[*] Training XGBoost Regressor...")
        xgb_model = xgb.XGBRegressor(
            n_estimators=250,
            learning_rate=0.05,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            n_jobs=-1
        )
        xgb_model.fit(X_train, y_train)
        xgb_preds = xgb_model.predict(X_test)
        results['XGBoost'] = evaluate_model("XGBoost Regressor", y_test, xgb_preds)
        trained_models['xgb'] = xgb_model
    else:
        xgb_preds = None

    # 3. LightGBM Regressor (Candidate)
    if HAS_LGB:
        print("[*] Training LightGBM Regressor...")
        lgb_model = lgb.LGBMRegressor(
            n_estimators=220,
            learning_rate=0.06,
            num_leaves=31,
            min_child_samples=20,
            random_state=42,
            n_jobs=-1
        )
        lgb_model.fit(X_train, y_train)
        lgb_preds = lgb_model.predict(X_test)
        results['LightGBM'] = evaluate_model("LightGBM Regressor", y_test, lgb_preds)
        trained_models['lgb'] = lgb_model
    else:
        lgb_preds = None

    # 4. Ensemble Learning (if candidates available)
    if HAS_XGB and HAS_LGB:
        print("[*] Evaluating Weighted Ensemble (RF 0.30 + XGB 0.45 + LGBM 0.25)...")
        ensemble_preds = (0.30 * rf_preds) + (0.45 * xgb_preds) + (0.25 * lgb_preds)
        results['Ensemble'] = evaluate_model("Weighted Ensemble", y_test, ensemble_preds)

    # 5. Extract Feature Importance from Random Forest
    rf_importance = dict(zip(feature_names, rf.feature_importances_))
    sorted_importance = sorted(rf_importance.items(), key=lambda x: x[1], reverse=True)

    return results, trained_models, sorted_importance


def main():
    dataset_path = os.path.join(DATASET_DIR, 'KAG_energydata_complete.csv')

    # Fallback to local file check
    if not os.path.exists(dataset_path):
        print(f"[!] Dataset not found at {dataset_path}.")
        print("[!] Please place KAG_energydata_complete.csv in dataset/ directory.")
        return

    df = load_and_preprocess_data(dataset_path)
    X, y, feature_names = prepare_features(df)

    # Chronological 80/20 train/test split (NEVER random shuffle time-series data)
    split_idx = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

    print(f"[*] Train set size: {len(X_train)} records (earlier observations)")
    print(f"[*] Test set size: {len(X_test)} records (later holdout observations)")

    # Benchmark models
    results, models, feature_importances = train_and_compare_models(
        X_train, y_train, X_test, y_test, feature_names
    )

    # Display evaluation summary
    print("\n" + "=" * 60)
    print("MODEL EVALUATION BENCHMARKS (Holdout Test Set)")
    print("=" * 60)
    for model_name, metrics in results.items():
        print(f"Model: {metrics['model']}")
        print(f"  MAE  : {metrics['MAE']:.4f} Wh")
        print(f"  MSE  : {metrics['MSE']:.4f} Wh²")
        print(f"  RMSE : {metrics['RMSE']:.4f} Wh")
        print(f"  R²   : {metrics['R2']:.4f}")
        print(f"  Note : {metrics['interpretation']}")
        print("-" * 60)

    # Serialize best / selected model
    model_save_path = os.path.join(BASE_DIR, 'forecast_model.pkl')
    print(f"[*] Serializing primary model to: {model_save_path}")
    joblib.dump(models['rf'], model_save_path)

    # Save feature metadata
    metadata_path = os.path.join(BASE_DIR, 'model_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump({
            'features': feature_names,
            'results': results,
            'top_features': feature_importances[:10],
            'trained_at': datetime.now().isoformat()
        }, f, indent=2)
    print(f"[*] Saved model metadata to: {metadata_path}")


if __name__ == '__main__':
    main()
