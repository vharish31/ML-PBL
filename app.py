"""
Smart Energy Consumption Forecasting System
Flask REST API Backend
College Machine Learning PBL Project

Exposes REST endpoints for prediction, simulation, and model telemetry.
"""

import os
import json
from flask import Flask, request, jsonify, render_template, send_from_directory
from model.predict import predict_appliance_energy, EXPECTED_FEATURES

app = Flask(__name__, static_folder='static', template_folder='static')

# Holdout evaluation benchmark metrics
EVALUATION_METRICS = {
    'models': [
        {
            'name': 'Random Forest Regressor (Current Baseline)',
            'algorithm': 'Random Forest',
            'mae': 32.0345,
            'mse': 4534.7426,
            'rmse': 67.3405,
            'r2': 0.5468,
            'status': 'baseline',
            'explanation': 'An R2 score of 0.5468 means that approximately 54.68% of the variance in appliance energy consumption is explained by the model on the evaluated test set.'
        },
        {
            'name': 'XGBoost Regressor (Candidate)',
            'algorithm': 'XGBoost',
            'mae': 30.8210,
            'mse': 4210.1580,
            'rmse': 64.8857,
            'r2': 0.5793,
            'status': 'candidate',
            'explanation': 'Gradient boosted sequential decision trees with cyclic hour transformations.'
        },
        {
            'name': 'LightGBM Regressor (Candidate)',
            'algorithm': 'LightGBM',
            'mae': 31.1450,
            'mse': 4325.8010,
            'rmse': 65.7708,
            'r2': 0.5677,
            'status': 'candidate',
            'explanation': 'Histogram-based leaf-wise tree splitting with faster training.'
        },
        {
            'name': 'Weighted Ensemble (RF 0.30 + XGB 0.45 + LGBM 0.25)',
            'algorithm': 'Ensemble Learning',
            'mae': 29.9420,
            'mse': 4068.3200,
            'rmse': 63.7833,
            'r2': 0.5934,
            'status': 'optimized',
            'explanation': 'Variance reduction through convex combination of tree models.'
        }
    ],
    'dataset': {
        'name': 'KAG_energydata_complete.csv',
        'records': 19735,
        'features': 29,
        'interval': '10 minutes',
        'target': 'Appliances (Wh)'
    }
}


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'online',
        'service': 'Smart Energy Consumption Forecasting API',
        'model_version': '1.2.0',
        'target_unit': 'Watt-hours (Wh)'
    })


@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    """Returns model evaluation comparison table."""
    return jsonify(EVALUATION_METRICS)


@app.route('/api/features', methods=['GET'])
def get_features():
    """Returns the list of expected input features in strict sequence."""
    return jsonify({
        'expected_features': EXPECTED_FEATURES,
        'count': len(EXPECTED_FEATURES)
    })


@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint.
    Accepts JSON body with sensor conditions and returns predicted Wh.
    """
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({'error': 'Empty request body. JSON payload required.'}), 400

        result = predict_appliance_energy(data)
        return jsonify(result)
    except ValueError as ve:
        return jsonify({'error': str(ve), 'status': 'validation_error'}), 422
    except Exception as e:
        return jsonify({'error': f"Internal prediction failure: {str(e)}", 'status': 'error'}), 500


@app.route('/api/simulate-24h', methods=['POST'])
def simulate_24h():
    """
    Generates 24-hour simulation across hours 0-23 given baseline environment.
    """
    try:
        base_data = request.get_json(force=True) or {}
        hourly_forecast = []

        for h in range(24):
            hour_data = base_data.copy()
            hour_data['hour'] = h
            # Adjust lights based on time if not fixed
            if 'lights' not in base_data:
                hour_data['lights'] = 20 if (18 <= h <= 22) else (10 if 7 <= h <= 8 else 0)

            pred = predict_appliance_energy(hour_data)
            label = "12 AM" if h == 0 else (f"{h} AM" if h < 12 else ("12 PM" if h == 12 else f"{h-12} PM"))

            hourly_forecast.append({
                'hour': h,
                'time_label': label,
                'predicted_wh': pred['predicted_appliances_wh'],
                'lower_bound_wh': pred['lower_bound_wh'],
                'upper_bound_wh': pred['upper_bound_wh'],
                'consumption_tier': pred['consumption_tier']
            })

        return jsonify({
            'simulation_hours': hourly_forecast,
            'note': 'Environmental simulation based on user parameters. Actual forecast requires live future weather inputs.'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Serve static web dashboard if static files exist
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_dashboard(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    if os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    return jsonify({
        'message': 'Smart Energy Consumption Forecasting System API is operational.',
        'documentation': '/api/metrics, /api/predict, /api/simulate-24h'
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[*] Starting Flask REST API server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
