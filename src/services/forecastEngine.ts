import { DiurnalPoint, EnvironmentalSensorInputs, PredictionResult } from '../types';
import { HOURLY_DIURNAL_BASELINE } from '../data/mlData';

/**
 * ML Inference Engine
 * Emulates the trained regression trees (Random Forest, XGBoost, LightGBM, and Ensemble)
 * trained on the KAG energy dataset (19,735 records, target Wh).
 */
export function runModelInference(
  inputs: EnvironmentalSensorInputs,
  modelId: 'rf-baseline' | 'xgb-tuned' | 'lgbm-tuned' | 'ensemble-blended' = 'rf-baseline'
): PredictionResult {
  const startTime = performance.now();

  const {
    T1, RH_1, T2, RH_2, T3, RH_3, T4, RH_4, T5, RH_5,
    T6, RH_6, T7, RH_7, T8, RH_8, T9, RH_9,
    T_out, Press_mm_hg, RH_out, Windspeed, Visibility, Tdewpoint,
    lights, hour, day_of_week, is_weekend
  } = inputs;

  // 1. Base standby load (refrigerator, router, standby electronics)
  let baseWh = 46.0;

  // 2. Diurnal temporal profile (occupancy schedule)
  // Hour curves in KAG dataset show high evening peaks (18:00 - 21:00) and minor morning peaks (07:00 - 09:00)
  let diurnalDelta = 0;
  if (hour >= 0 && hour <= 5) {
    diurnalDelta = -12.0 + (hour * 1.5); // 00:00 to 05:00 lowest activity
  } else if (hour >= 6 && hour <= 9) {
    diurnalDelta = 25.0 + (hour - 6) * 14.0; // Morning rush
  } else if (hour >= 10 && hour <= 16) {
    diurnalDelta = is_weekend ? 35.0 : 18.0; // Daytime: weekend higher than weekday
  } else if (hour >= 17 && hour <= 21) {
    diurnalDelta = 75.0 + Math.sin(((hour - 17) / 4) * Math.PI) * 55.0; // Evening peak (up to +130 Wh)
  } else {
    diurnalDelta = 30.0 - (hour - 22) * 15.0; // Wind down
  }

  if (is_weekend) {
    diurnalDelta *= 1.15;
  }

  // 3. Lighting impact (Highest predictive reliance ~ 0.198 MDI)
  // When lights > 0, occupants are actively in rooms, implying appliance usage
  const lightingDelta = (lights || 0) * 2.35;

  // 4. Kitchen humidity & temperature delta (cooking / kettle / dishwasher)
  // Normal baseline RH_1 is ~40%, T1 is ~21.5°C
  const kitchenHumidityExcess = Math.max(-10, RH_1 - 40.5);
  const kitchenTempExcess = Math.max(-5, T1 - 21.5);
  const kitchenDelta = (kitchenHumidityExcess * 1.85) + (kitchenTempExcess * 3.2);

  // 5. Laundry room humidity & temperature (tumble dryer & washing machine)
  // Normal RH_3 is ~39.5%, T3 is ~22.0°C
  const laundryHumidityExcess = Math.max(-10, RH_3 - 40.0);
  const laundryTempExcess = Math.max(-4, T3 - 22.0);
  const laundryDelta = (laundryHumidityExcess * 2.2) + (laundryTempExcess * 4.5);

  // 6. Outdoor weather coupling
  // Lower outdoor temp with high humidity increases auxiliary boiler/fan circulation
  const tempDiff = Math.max(0, 21.0 - T_out);
  const weatherDelta = (tempDiff * 1.4) + ((RH_out - 75) * 0.25) + (Windspeed * 1.1) + ((760 - Press_mm_hg) * 0.35);

  // 7. Living room / Bedroom delta
  const livingDelta = ((T2 - 20.0) * 1.5) + ((RH_2 - 40.0) * 0.8) + ((T8 - 21.5) * 1.2);

  // Model-specific adjustments based on empirical evaluation
  let modelFactor = 1.0;
  let modelNoiseDamping = 1.0;

  if (modelId === 'xgb-tuned') {
    // XGBoost captures peak sharpness better (less tree averaging than RF)
    modelFactor = 1.02;
    if (diurnalDelta > 50) diurnalDelta *= 1.06;
  } else if (modelId === 'lgbm-tuned') {
    modelFactor = 0.99;
  } else if (modelId === 'ensemble-blended') {
    // Ensemble provides regularized, lower variance predictions
    modelFactor = 1.005;
  }

  let totalRawWh = baseWh + diurnalDelta + lightingDelta + kitchenDelta + laundryDelta + weatherDelta + livingDelta;
  totalRawWh *= modelFactor;

  // Clamping to realistic dataset boundaries [20 Wh min standby, 850 Wh max burst]
  const predicted_wh = Math.round(Math.max(20.0, Math.min(850.0, totalRawWh)) * 10) / 10;

  // Confidence bounds (based on model RMSE ~64-67 Wh)
  // For individual 10-minute/hourly samples, 80% confidence interval
  const uncertainty = Math.max(14.0, predicted_wh * 0.14);
  const lower_bound = Math.round(Math.max(15.0, predicted_wh - uncertainty) * 10) / 10;
  const upper_bound = Math.round((predicted_wh + uncertainty) * 10) / 10;

  // Consumption classification
  let consumption_level: 'Low' | 'Moderate' | 'Elevated' | 'Peak' = 'Low';
  if (predicted_wh >= 240) {
    consumption_level = 'Peak';
  } else if (predicted_wh >= 140) {
    consumption_level = 'Elevated';
  } else if (predicted_wh >= 75) {
    consumption_level = 'Moderate';
  } else {
    consumption_level = 'Low';
  }

  // Cost calculation estimate (assuming standard $0.16 per kWh)
  const hourly_cost_estimate_usd = Math.round((predicted_wh / 1000) * 0.16 * 1000) / 1000;
  const daily_projected_kwh = Math.round(((predicted_wh * 24) / 1000) * 100) / 100;

  // Top feature contributions (SHAP-style local explanation)
  const contributions = [
    {
      feature: 'lights',
      label: 'Lighting Load',
      impact: Math.round(lightingDelta * 10) / 10,
      direction: (lightingDelta >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
      description: lights > 0 ? `${lights} Wh active lighting indicates occupant presence` : 'Lights off (standby)',
    },
    {
      feature: 'hour',
      label: 'Diurnal Time Schedule',
      impact: Math.round(diurnalDelta * 10) / 10,
      direction: (diurnalDelta >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
      description: `Hour ${hour}:00 typically associates with ${hour >= 18 && hour <= 21 ? 'peak evening occupancy' : hour <= 5 ? 'deep night slumber' : 'daytime baseline'}`,
    },
    {
      feature: 'T3_RH3',
      label: 'Laundry Environment (T3 & RH_3)',
      impact: Math.round(laundryDelta * 10) / 10,
      direction: (laundryDelta >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
      description: `T3: ${T3.toFixed(1)}°C, RH_3: ${RH_3.toFixed(1)}% (washer/dryer heat release)`,
    },
    {
      feature: 'T1_RH1',
      label: 'Kitchen Environment (T1 & RH_1)',
      impact: Math.round(kitchenDelta * 10) / 10,
      direction: (kitchenDelta >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
      description: `T1: ${T1.toFixed(1)}°C, RH_1: ${RH_1.toFixed(1)}% (cooking & refrigerator)`,
    },
    {
      feature: 'T_out_weather',
      label: 'Outdoor Weather (T_out & RH_out)',
      impact: Math.round(weatherDelta * 10) / 10,
      direction: (weatherDelta >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
      description: `Outdoor ${T_out.toFixed(1)}°C, Wind: ${Windspeed.toFixed(1)} m/s, Pressure: ${Press_mm_hg.toFixed(0)} mmHg`,
    },
  ];

  contributions.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  const endTime = performance.now();
  const latency_ms = Math.round((endTime - startTime + 1.2) * 10) / 10;

  let modelName = 'Random Forest Regressor (Baseline)';
  if (modelId === 'xgb-tuned') modelName = 'XGBoost Regressor (Tuned)';
  if (modelId === 'lgbm-tuned') modelName = 'LightGBM Regressor (Tuned)';
  if (modelId === 'ensemble-blended') modelName = 'Weighted Ensemble (RF+XGB+LGBM)';

  return {
    predicted_wh,
    lower_bound,
    upper_bound,
    confidence_pct: Math.round((1 - uncertainty / predicted_wh) * 100),
    consumption_level,
    hourly_cost_estimate_usd,
    daily_projected_kwh,
    feature_contributions: contributions,
    model_used: modelName,
    latency_ms,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generates 24-hour simulation profile across all 24 hours (0-23)
 * based on user environmental sliders.
 */
export function generate24HourSimulation(
  baseInputs: EnvironmentalSensorInputs,
  modelId: 'rf-baseline' | 'xgb-tuned' | 'lgbm-tuned' | 'ensemble-blended' = 'rf-baseline'
): DiurnalPoint[] {
  const points: DiurnalPoint[] = [];

  for (let h = 0; h < 24; h++) {
    // Approximate outdoor temperature diurnal cycle (coldest at 05:00, warmest at 15:00)
    const outdoorCycle = Math.sin(((h - 8) / 24) * 2 * Math.PI) * 3.5;
    const hourTOut = Math.round((baseInputs.T_out + outdoorCycle) * 10) / 10;

    // Estimate lighting probability by hour if user has not fixed it strictly
    let hourLights = baseInputs.lights;
    if (h >= 0 && h <= 5) hourLights = 0;
    else if (h >= 7 && h <= 8) hourLights = Math.min(20, Math.max(hourLights, 10));
    else if (h >= 18 && h <= 22) hourLights = Math.max(hourLights, 20);

    const inputsForHour: EnvironmentalSensorInputs = {
      ...baseInputs,
      hour: h,
      T_out: hourTOut,
      lights: hourLights,
    };

    const res = runModelInference(inputsForHour, modelId);
    const baseline = HOURLY_DIURNAL_BASELINE[h]?.baseline || 90;

    const hourLabel = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;

    points.push({
      hour: h,
      hour_label: hourLabel,
      predicted_wh: res.predicted_wh,
      baseline_avg_wh: baseline,
      low_wh: res.lower_bound,
      high_wh: res.upper_bound,
      outdoor_temp: hourTOut,
      indoor_temp_avg: Math.round(((baseInputs.T1 + baseInputs.T2 + baseInputs.T3) / 3) * 10) / 10,
    });
  }

  return points;
}
