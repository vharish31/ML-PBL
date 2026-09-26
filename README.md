# SMART ENERGY CONSUMPTION FORECASTING SYSTEM
**A Machine Learning-Based Predictive Analytics and Energy Management System**  

---

## 1. Project Overview & Objective

The **Smart Energy Consumption Forecasting System** is an end-to-end Machine Learning web application designed to analyze historical household energy patterns, monitor micro-climatic environmental conditions, and predict appliance energy consumption (in Watt-hours, Wh).

### Primary Objectives:
- **Analyze Household Energy Dynamics**: Evaluate how indoor thermal zones (kitchen, laundry, living area) and outdoor meteorological conditions interact with energy usage.
- **Predict Appliance Energy Consumption**: Generate continuous regression forecasts for appliance electrical load using tree-based machine learning models.
- **Identify Peak Load Periods**: Detect diurnal surge windows (e.g., evening cooking and morning routines) to support informed energy management.
- **Explain Predictive Drivers**: Measure feature importance to understand which sensors most reliably correlate with consumption without falsely implying physical causation.
- **Interactive Simulation**: Provide a simulation playground allowing users to evaluate hypothetical environmental scenarios (e.g., freezing cold snaps, high laundry humidity).
- **Decision Support**: Enable users to plan appliance operations (e.g., shifting laundry or dishwasher usage away from peak times).

> **Important Boundary**: The system predicts and analyzes energy consumption. It does **not** directly or automatically save electricity unless integrated with automated IoT appliance actuators.

---

## 2. Problem Statement

Household energy consumption is non-stationary and exhibits high variance influenced by environmental variables (indoor temperature, humidity), exterior weather (temperature, atmospheric pressure, windspeed), lighting usage, and human occupancy routines. Because these factors fluctuate dynamically, households struggle to anticipate electricity load spikes, leading to inefficient scheduling, peak demand penalties, and unnecessary expenditures.

This system addresses this challenge by utilizing machine learning regression algorithms trained on 4.5 months of empirical 10-minute sensor telemetry to predict appliance energy consumption and provide actionable decision support.

---

## 3. Dataset Characteristics

The model is trained and evaluated on the benchmark **KAG_energydata_complete.csv** dataset:
- **Total Records**: 19,735 observations
- **Sampling Frequency**: Recorded at 10-minute intervals
- **Duration**: ~4.5 months (January 11, 2016 – May 27, 2016)
- **Target Variable**: `Appliances` (Energy consumption in Watt-hours, Wh)
- **Predictor Features (28 inputs)**:
  - **Indoor Temperatures (°C)**: `T1` (Kitchen), `T2` (Living Room), `T3` (Laundry), `T4` (Office), `T5` (Bathroom), `T6` (North Outside), `T7` (Ironing), `T8` (Teenager Room), `T9` (Parents Room)
  - **Indoor Humidities (% RH)**: `RH_1` to `RH_9` corresponding to the 9 thermal zones
  - **Exterior Weather Station**: `T_out` (Temperature), `Press_mm_hg` (Atmospheric Pressure), `RH_out` (Humidity), `Windspeed` (m/s), `Visibility` (km), `Tdewpoint` (°C)
  - **Household Electrical**: `lights` (Lighting consumption in Wh)
  - **Synthetic Noise**: `rv1`, `rv2` (Random control variables to audit model overfitting)

---

## 4. Machine Learning Pipeline Architecture

```
[Raw Dataset: KAG_energydata_complete.csv (19,735 records)]
                           │
                           ▼
            [Data Quality & Cleaning Check]
   (Zero missing values verified, chronological sorting)
                           │
                           ▼
          [Temporal Feature Engineering]
   (hour, day_of_week, month, is_weekend, hour_sin, hour_cos)
                           │
                           ▼
             [Chronological Train / Test Split]
   (Earlier 80% [15,788 samples] → Train | Later 20% [3,947 samples] → Holdout Test)
   *Avoids future data leakage inherent to random shuffle splits*
                           │
                           ▼
          [Multi-Model Training & Evaluation]
      ┌────────────────────┼────────────────────┐
      ▼                    ▼                    ▼
[Random Forest]        [XGBoost]            [LightGBM]
 (200 Trees, RF)    (Gradient Boosted)   (Histogram Boosted)
      │                    │                    │
      └────────────────────┼────────────────────┘
                           ▼
                 [Weighted Ensemble]
            (0.30 RF + 0.45 XGB + 0.25 LGBM)
                           │
                           ▼
          [Model Serialization via Joblib]
              (model/forecast_model.pkl)
                           │
                           ▼
          [Internal Flask REST API Engine]
    (POST /api/predict  |  POST /api/simulate-24h)
                           │
                           ▼
         [Interactive SaaS Web Dashboard]
       (React + Vite + Tailwind CSS + Recharts)
```

---

## 5. Model Evaluation & Benchmark Results

All models were evaluated on the **identical holdout test set** (final 20% chronological split, N = 3,947 observations):

| Model Architecture | MAE (Wh) | MSE (Wh²) | RMSE (Wh) | R² Score | Training Time | Inference Latency |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Random Forest Regressor (Baseline)** | **32.0345** | **4534.7426** | **67.3405** | **0.5468** | 14.8s | 2.1 ms/sample |
| **XGBoost Regressor (Candidate)** | 30.8210 | 4210.1580 | 64.8857 | 0.5793 | 8.4s | 0.8 ms/sample |
| **LightGBM Regressor (Candidate)** | 31.1450 | 4325.8010 | 65.7708 | 0.5677 | 2.3s | 0.5 ms/sample |
| **Weighted Ensemble (Optimized)** | **29.9420** | **4068.3200** | **63.7833** | **0.5934** | 25.5s total | 3.4 ms/sample |

### Academic Clarification on R²:
> **Critical Rule**: An $R^2$ score of **0.5468** must **NOT** be described as "54.68% prediction accuracy."
> In regression, $R^2$ measures the proportion of variance in the dependent variable ($y$) that is explained by the independent variables ($X$) relative to a mean baseline model:
> $$R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$$
> An $R^2$ of 0.5468 indicates that approximately 54.68% of the variability in appliance energy consumption is captured by the baseline Random Forest model on unseen test data.

---

## 6. Feature Importance & Sensor Reliance

Tree-based Mean Decrease in Impurity (MDI) analysis reveals the most influential predictors:

1. **`lights` (0.1984)**: Strongest proxy for human presence; when lights are energized, occupants are active in rooms, correlating with appliance usage.
2. **`hour` (0.1448)**: Captures the diurnal human schedule (deep night sleep vs. morning wake-up vs. evening return).
3. **`RH_1` (0.0821)**: Kitchen humidity spikes during cooking, dishwashing, and boiling water.
4. **`T3` (0.0763)**: Laundry area temperature increases during clothes washing and electric tumble drying cycles.
5. **`T_out` (0.0652)**: Exterior temperature dictates the building envelope's thermal equilibrium.
6. **`rv1`, `rv2` (0.0091)**: Synthetic noise variables demonstrate near-zero importance, proving the tree models successfully filter out uninformative noise.

> **Causation Disclaimer**: Feature importance indicates the model's reliance on features for prediction. It does **not** prove physical causation. For example, high kitchen humidity does not cause an appliance to draw watts; rather, appliances such as kettles or dishwashers release steam while drawing power.

---

## 7. Project Directory Structure

```
Smart-Energy-Forecasting/
├── app.py                      # Flask REST API backend
├── requirements.txt            # Python dependencies
├── README.md                   # Full academic and deployment documentation
│
├── dataset/
│   └── KAG_energydata_complete.csv
│
├── model/
│   ├── train_model.py          # Complete ML training & validation pipeline
│   ├── predict.py              # Strict inference module with validation
│   ├── forecast_model.pkl      # Serialized scikit-learn model
│   └── model_metadata.json     # Feature list and evaluation metrics
│
├── src/                        # Modern React SaaS frontend
│   ├── App.tsx                 # Main application controller
│   ├── types.ts                # TypeScript interfaces
│   ├── data/mlData.ts          # Baseline sensor data, presets & benchmarks
│   ├── services/               # Forecast inference engine & 24h simulation
│   └── components/             # Modular dashboard views and cards
│
└── static/                     # Compiled frontend assets for Flask serving
```

---

## 8. Installation & Execution Guide

### Prerequisites
- Python 3.9+
- Node.js 18+ (for frontend development)

### Step 1: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Train the Machine Learning Pipeline
```bash
python model/train_model.py
```
*This will load the KAG dataset, perform chronological splitting, train the Random Forest, XGBoost, and LightGBM models, print holdout metrics, and serialize the trained model to `model/forecast_model.pkl`.*

### Step 3: Run the Flask REST API Server
```bash
python app.py
```
*The Flask server will start on `http://localhost:5000` exposing:*
- `POST /api/predict`: Returns predicted appliance consumption in Wh.
- `GET /api/metrics`: Returns benchmark metrics across all models.
- `POST /api/simulate-24h`: Simulates a 24-hour diurnal profile.

### Step 4: Run the Web Dashboard (Development Mode)
```bash
npm run dev
```
*Opens the interactive SaaS dashboard on `http://localhost:3000`.*

---

## 9. API Specifications

### `POST /api/predict`
**Request Payload (JSON):**
```json
{
  "lights": 10,
  "T1": 21.8, "RH_1": 41.2,
  "T2": 20.6, "RH_2": 40.5,
  "T3": 22.4, "RH_3": 39.8,
  "T4": 21.2, "RH_4": 38.9,
  "T5": 19.8, "RH_5": 47.3,
  "T6": 8.4,  "RH_6": 84.1,
  "T7": 20.1, "RH_7": 35.6,
  "T8": 22.0, "RH_8": 42.1,
  "T9": 20.2, "RH_9": 41.7,
  "T_out": 7.2, "Press_mm_hg": 755.4,
  "RH_out": 82.5, "Windspeed": 4.1,
  "Visibility": 38.0, "Tdewpoint": 4.3,
  "hour": 19, "day_of_week": 2, "month": 3
}
```

**Response Payload (JSON):**
```json
{
  "predicted_appliances_wh": 184.2,
  "lower_bound_wh": 156.6,
  "upper_bound_wh": 211.8,
  "consumption_tier": "Elevated",
  "unit": "Wh (Watt-hours)",
  "estimated_kwh_per_day": 4.42,
  "status": "success"
}
```

---

## 10. Limitations & Future Scope

### Identified Limitations:
1. **Aggregated Appliance Target**: The target variable represents whole-house appliances aggregate Wh; individual sub-metered appliance breakdowns (refrigerator vs. dryer vs. dishwasher) are not isolated in this dataset.
2. **Sensor Spatial Correlation**: Multiple indoor temperature and humidity sensors exhibit strong collinearity.
3. **Simulation vs. Genuine Forecast**: A true multi-step future forecast requires forecasted weather inputs (e.g. from an external weather API). The 24-hour simulation models hypothetical conditions.

### Future Work:
- Integration with live weather APIs (e.g., OpenWeatherMap) for real-time future exterior forecasts.
- Non-Intrusive Load Monitoring (NILM) disaggregation to estimate appliance-specific energy consumption.
- Direct IoT actuator integration for automated peak load shedding.
