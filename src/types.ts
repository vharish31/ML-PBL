export interface EnvironmentalSensorInputs {
  // Indoor Temperatures (°C)
  T1: number; // Kitchen area
  T2: number; // Living room area
  T3: number; // Laundry room area
  T4: number; // Office room
  T5: number; // Bathroom
  T6: number; // Outside building (north side)
  T7: number; // Ironing room
  T8: number; // Teenager room 2
  T9: number; // Parents room

  // Indoor Humidities (% RH)
  RH_1: number; // Kitchen area
  RH_2: number; // Living room area
  RH_3: number; // Laundry room area
  RH_4: number; // Office room
  RH_5: number; // Bathroom
  RH_6: number; // Outside building (north side)
  RH_7: number; // Ironing room
  RH_8: number; // Teenager room 2
  RH_9: number; // Parents room

  // Outdoor Weather
  T_out: number; // Outside temperature (°C)
  Press_mm_hg: number; // Atmospheric pressure (mm Hg)
  RH_out: number; // Outside relative humidity (%)
  Windspeed: number; // Wind speed (m/s)
  Visibility: number; // Visibility (km)
  Tdewpoint: number; // Dew point temperature (°C)

  // Energy & Temporal
  lights: number; // Light energy consumption (Wh)
  hour: number; // 0 - 23
  day_of_week: number; // 0=Mon, 6=Sun
  month: number; // 1 - 12
  is_weekend: boolean;
  rv1?: number; // Random variable 1
  rv2?: number; // Random variable 2
}

export type SupportedModelId = 
  | 'rf-baseline' 
  | 'xgb-tuned' 
  | 'lgbm-tuned' 
  | 'ensemble-blended' 
  | 'linear-reg' 
  | 'logistic-reg'
  | 'xgb-lagged'
  | 'neural-net'
  | 'super-ensemble';

export interface PredictionResult {
  predicted_wh: number;
  lower_bound: number;
  upper_bound: number;
  confidence_pct: number;
  consumption_level: 'Low' | 'Moderate' | 'Elevated' | 'Peak';
  hourly_cost_estimate_usd: number;
  daily_projected_kwh: number;
  feature_contributions: Array<{
    feature: string;
    label: string;
    impact: number;
    direction: 'positive' | 'negative';
    description: string;
  }>;
  model_used: string;
  latency_ms: number;
  timestamp: string;
  surge_probability?: number;
}

export interface ModelMetric {
  id: string;
  name: string;
  algorithm: string;
  mae: number;
  mse: number;
  rmse: number;
  r2: number;
  status: 'baseline' | 'candidate' | 'optimized' | 'evaluated' | 'state-of-the-art';
  notes: string;
  training_time: string;
  inference_speed: string;
  hyperparameters: Record<string, string | number>;
}

export interface FeatureImportanceItem {
  feature: string;
  label: string;
  importance: number;
  category: 'Usage' | 'Temporal' | 'Indoor Climate' | 'Outdoor Weather' | 'Noise';
  sensor_location: string;
  description: string;
}

export interface DiurnalPoint {
  hour: number;
  hour_label: string;
  predicted_wh: number;
  baseline_avg_wh: number;
  low_wh: number;
  high_wh: number;
  outdoor_temp: number;
  indoor_temp_avg: number;
}

export interface VerificationSample {
  id: string;
  timestamp: string;
  actual_wh: number;
  predicted_wh: number;
  error_wh: number;
  error_pct: number;
  t_out: number;
  rh_out: number;
  lights: number;
  hour: number;
  accuracy_band: 'High (<15% error)' | 'Acceptable (<30% error)' | 'Spike/Variance';
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface SimulationPreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  scenario: 'peak' | 'normal' | 'eco' | 'night';
  inputs: Partial<EnvironmentalSensorInputs>;
}
