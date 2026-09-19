import React, { useState } from 'react';
import { 
  PlayCircle, 
  RotateCcw, 
  Sparkles, 
  Thermometer, 
  Droplets, 
  Sun, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  HelpCircle,
  Zap,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { EnvironmentalSensorInputs, PredictionResult } from '../types';
import { DEFAULT_SENSOR_INPUTS, SENSOR_LOCATIONS, VERIFICATION_SAMPLES } from '../data/mlData';
import { formatWh, formatTemp, formatHumidity, formatHour, getTierColor } from '../utils/formatters';

interface LivePredictorProps {
  inputs: EnvironmentalSensorInputs;
  onInputChange: (newInputs: EnvironmentalSensorInputs) => void;
  prediction: PredictionResult;
  selectedModelId: 'rf-baseline' | 'xgb-tuned' | 'lgbm-tuned' | 'ensemble-blended';
  onModelChange: (modelId: 'rf-baseline' | 'xgb-tuned' | 'lgbm-tuned' | 'ensemble-blended') => void;
  onResetToBaseline: () => void;
}

export const LivePredictor: React.FC<LivePredictorProps> = ({
  inputs,
  onInputChange,
  prediction,
  selectedModelId,
  onModelChange,
  onResetToBaseline,
}) => {
  const [activeTab, setActiveTab] = useState<'indoor' | 'outdoor' | 'usage'>('indoor');

  const handleNumericChange = (key: keyof EnvironmentalSensorInputs, value: number) => {
    onInputChange({
      ...inputs,
      [key]: value,
    });
  };

  const handleLoadSample = () => {
    const randomSample = VERIFICATION_SAMPLES[Math.floor(Math.random() * VERIFICATION_SAMPLES.length)];
    onInputChange({
      ...inputs,
      T_out: randomSample.t_out,
      RH_out: randomSample.rh_out,
      lights: randomSample.lights,
      hour: randomSample.hour,
    });
  };

  const tierColors = getTierColor(prediction.consumption_level);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <PlayCircle className="h-3.5 w-3.5 text-emerald-600" />
                Live Regression Engine
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Unit: Watt-hours (Wh)</span>
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Appliance Energy Consumption Predictor
            </h1>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl leading-relaxed">
              Adjust multi-zone environmental telemetry, weather, and occupancy factors.
              The model immediately computes instantaneous appliance energy consumption with confidence bounds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              title="Load holdout test record"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Load Test Sample</span>
            </button>
            <button
              onClick={onResetToBaseline}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              title="Reset to dataset median conditions"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              <span>Reset Median</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left Controls, Right Prediction Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Tabbed Sensor Controls (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-3 gap-2">
            <button
              onClick={() => setActiveTab('indoor')}
              className={`flex items-center gap-2 border-b-2 px-3 pb-3 text-xs font-semibold transition ${
                activeTab === 'indoor'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Thermometer className="h-4 w-4" />
              <span>Indoor Micro-Climates (T1–T9, RH1–RH9)</span>
            </button>

            <button
              onClick={() => setActiveTab('outdoor')}
              className={`flex items-center gap-2 border-b-2 px-3 pb-3 text-xs font-semibold transition ${
                activeTab === 'outdoor'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sun className="h-4 w-4" />
              <span>Exterior Weather Station</span>
            </button>

            <button
              onClick={() => setActiveTab('usage')}
              className={`flex items-center gap-2 border-b-2 px-3 pb-3 text-xs font-semibold transition ${
                activeTab === 'usage'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Lighting & Diurnal Schedule</span>
            </button>
          </div>

          {/* TAB 1: INDOOR MICRO-CLIMATES */}
          {activeTab === 'indoor' && (
            <div className="rounded-b-2xl border border-t-0 border-slate-200 bg-white p-5 space-y-6">
              <div className="text-xs text-slate-500">
                Configure room temperature (°C) and relative humidity (% RH) for each household thermal zone.
              </div>

              {/* Room Cards Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Kitchen T1 / RH_1 */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Kitchen Area</span>
                    <span className="text-[10px] font-mono text-slate-400">T1 / RH_1</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Temperature:</span>
                      <span className="font-semibold">{inputs.T1.toFixed(1)}°C</span>
                    </div>
                    <input
                      type="range"
                      min="16"
                      max="28"
                      step="0.1"
                      value={inputs.T1}
                      onChange={(e) => handleNumericChange('T1', parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Relative Humidity:</span>
                      <span className="font-semibold">{inputs.RH_1.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="75"
                      step="0.5"
                      value={inputs.RH_1}
                      onChange={(e) => handleNumericChange('RH_1', parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Laundry T3 / RH_3 */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Laundry Room</span>
                    <span className="text-[10px] font-mono text-slate-400">T3 / RH_3</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Temperature:</span>
                      <span className="font-semibold">{inputs.T3.toFixed(1)}°C</span>
                    </div>
                    <input
                      type="range"
                      min="16"
                      max="29"
                      step="0.1"
                      value={inputs.T3}
                      onChange={(e) => handleNumericChange('T3', parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Relative Humidity:</span>
                      <span className="font-semibold">{inputs.RH_3.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="75"
                      step="0.5"
                      value={inputs.RH_3}
                      onChange={(e) => handleNumericChange('RH_3', parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Living Room T2 / RH_2 */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Living Room</span>
                    <span className="text-[10px] font-mono text-slate-400">T2 / RH_2</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Temperature:</span>
                      <span className="font-semibold">{inputs.T2.toFixed(1)}°C</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="27"
                      step="0.1"
                      value={inputs.T2}
                      onChange={(e) => handleNumericChange('T2', parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Relative Humidity:</span>
                      <span className="font-semibold">{inputs.RH_2.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="70"
                      step="0.5"
                      value={inputs.RH_2}
                      onChange={(e) => handleNumericChange('RH_2', parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Office Room T4 / RH_4 */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Office Room</span>
                    <span className="text-[10px] font-mono text-slate-400">T4 / RH_4</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Temperature:</span>
                      <span className="font-semibold">{inputs.T4.toFixed(1)}°C</span>
                    </div>
                    <input
                      type="range"
                      min="16"
                      max="27"
                      step="0.1"
                      value={inputs.T4}
                      onChange={(e) => handleNumericChange('T4', parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Relative Humidity:</span>
                      <span className="font-semibold">{inputs.RH_4.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="65"
                      step="0.5"
                      value={inputs.RH_4}
                      onChange={(e) => handleNumericChange('RH_4', parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Teenager Room T8 / RH_8 */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Teenager Room</span>
                    <span className="text-[10px] font-mono text-slate-400">T8 / RH_8</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Temperature:</span>
                      <span className="font-semibold">{inputs.T8.toFixed(1)}°C</span>
                    </div>
                    <input
                      type="range"
                      min="16"
                      max="27"
                      step="0.1"
                      value={inputs.T8}
                      onChange={(e) => handleNumericChange('T8', parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Relative Humidity:</span>
                      <span className="font-semibold">{inputs.RH_8.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="70"
                      step="0.5"
                      value={inputs.RH_8}
                      onChange={(e) => handleNumericChange('RH_8', parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Parents Room T9 / RH_9 */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Parents Bedroom</span>
                    <span className="text-[10px] font-mono text-slate-400">T9 / RH_9</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Temperature:</span>
                      <span className="font-semibold">{inputs.T9.toFixed(1)}°C</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="26"
                      step="0.1"
                      value={inputs.T9}
                      onChange={(e) => handleNumericChange('T9', parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Relative Humidity:</span>
                      <span className="font-semibold">{inputs.RH_9.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="65"
                      step="0.5"
                      value={inputs.RH_9}
                      onChange={(e) => handleNumericChange('RH_9', parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OUTDOOR WEATHER */}
          {activeTab === 'outdoor' && (
            <div className="rounded-b-2xl border border-t-0 border-slate-200 bg-white p-5 space-y-5">
              <div className="text-xs text-slate-500">
                Weather conditions measured at the on-site meteorological weather station.
              </div>

              <div className="space-y-4">
                {/* Outdoor Temp */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Outdoor Temperature (T_out)</span>
                    <span className="font-mono font-semibold text-emerald-700">{inputs.T_out.toFixed(1)}°C</span>
                  </div>
                  <input
                    type="range"
                    min="-5"
                    max="30"
                    step="0.1"
                    value={inputs.T_out}
                    onChange={(e) => handleNumericChange('T_out', parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>-5°C (Winter Freeze)</span>
                    <span>15°C (Mild Spring)</span>
                    <span>30°C (Summer Peak)</span>
                  </div>
                </div>

                {/* Outdoor Humidity */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Outdoor Relative Humidity (RH_out)</span>
                    <span className="font-mono font-semibold text-emerald-700">{inputs.RH_out.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="0.5"
                    value={inputs.RH_out}
                    onChange={(e) => handleNumericChange('RH_out', parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Windspeed & Pressure in 2 cols */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">Wind Speed</span>
                      <span className="font-mono font-semibold">{inputs.Windspeed.toFixed(1)} m/s</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="0.2"
                      value={inputs.Windspeed}
                      onChange={(e) => handleNumericChange('Windspeed', parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">Atmospheric Pressure</span>
                      <span className="font-mono font-semibold">{inputs.Press_mm_hg.toFixed(0)} mmHg</span>
                    </div>
                    <input
                      type="range"
                      min="730"
                      max="780"
                      step="1"
                      value={inputs.Press_mm_hg}
                      onChange={(e) => handleNumericChange('Press_mm_hg', parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USAGE & DIURNAL */}
          {activeTab === 'usage' && (
            <div className="rounded-b-2xl border border-t-0 border-slate-200 bg-white p-5 space-y-5">
              <div className="text-xs text-slate-500">
                Electrical lighting and temporal features strongly indicating human occupant presence.
              </div>

              {/* Lighting Slider */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">Lighting Consumption (Wh)</span>
                    <span className="block text-[10px] text-slate-500">Highest predictive importance (~0.198 MDI)</span>
                  </div>
                  <span className="text-base font-extrabold text-emerald-700">{inputs.lights} Wh</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="10"
                  value={inputs.lights}
                  onChange={(e) => handleNumericChange('lights', parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                  <span>0 Wh (Off/Daylight)</span>
                  <span>20 Wh (Ambient)</span>
                  <span>40 Wh (Multi-room)</span>
                  <span>60 Wh (Full house active)</span>
                </div>
              </div>

              {/* Hour of day slider */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">Time of Day (Diurnal Cycle)</span>
                    <span className="block text-[10px] text-slate-500">Hour {inputs.hour}:00 ({formatHour(inputs.hour)})</span>
                  </div>
                  <span className="text-base font-extrabold text-emerald-700">{formatHour(inputs.hour)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="23"
                  step="1"
                  value={inputs.hour}
                  onChange={(e) => handleNumericChange('hour', parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                  <span>00:00 (Night)</span>
                  <span>08:00 (Morning)</span>
                  <span>14:00 (Midday)</span>
                  <span>19:00 (Evening Peak)</span>
                  <span>23:00</span>
                </div>
              </div>

              {/* Weekend toggle & day of week */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">Weekend Profile</span>
                    <span className="block text-[10px] text-slate-500">Occupancy elevated throughout daytime</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={inputs.is_weekend}
                    onChange={(e) => {
                      const isW = e.target.checked;
                      onInputChange({
                        ...inputs,
                        is_weekend: isW,
                        day_of_week: isW ? 5 : 2,
                      });
                    }}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">Day of Week</span>
                    <span className="block text-[10px] text-slate-500">0=Monday, 6=Sunday</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-700">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][inputs.day_of_week]}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Prediction Output Card (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
            {/* Model Architecture Selector */}
            <div>
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-emerald-600" />
                  Select Model Architecture
                </span>
                <span className="text-[10px] text-slate-400">Trained on KAG Data</span>
              </label>
              <select
                value={selectedModelId}
                onChange={(e) => onModelChange(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="rf-baseline">Random Forest Regressor (Baseline • R²=0.5468)</option>
                <option value="xgb-tuned">XGBoost Regressor (Candidate • R²=0.5793)</option>
                <option value="lgbm-tuned">LightGBM Regressor (Candidate • R²=0.5677)</option>
                <option value="ensemble-blended">Weighted Ensemble (RF+XGB+LGBM • R²=0.5934)</option>
              </select>
            </div>

            {/* Primary Predicted Number Display */}
            <div className={`rounded-2xl border p-4 text-center ${tierColors.bg} ${tierColors.border}`}>
              <span className="text-xs font-semibold text-slate-600 block">
                Instantaneous Predicted Appliance Load
              </span>
              <div className="mt-2 flex items-baseline justify-center gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                  {prediction.predicted_wh}
                </span>
                <span className="text-sm font-bold text-slate-600">Wh</span>
              </div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${tierColors.badge}`}>
                  {prediction.consumption_level} Demand
                </span>
                <span className="text-xs text-slate-500">
                  ±{((prediction.upper_bound - prediction.predicted_wh)).toFixed(1)} Wh margin
                </span>
              </div>
            </div>

            {/* Bounds & Latency */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <span className="text-[10px] font-bold uppercase text-slate-400">80% Confidence Band</span>
                <div className="mt-1 font-mono font-bold text-slate-800">
                  {prediction.lower_bound} – {prediction.upper_bound} Wh
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <span className="text-[10px] font-bold uppercase text-slate-400">Inference Latency</span>
                <div className="mt-1 font-mono font-bold text-emerald-700">
                  {prediction.latency_ms} ms
                </div>
              </div>
            </div>

            {/* Local Tree Path Feature Contributions */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <span className="text-xs font-bold text-slate-800 block">
                Local Feature Impact Breakdown
              </span>
              <div className="space-y-2 text-xs">
                {prediction.feature_contributions.slice(0, 4).map((fc) => (
                  <div key={fc.feature} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 truncate max-w-[180px]">{fc.label}</span>
                    <span className={`font-mono font-bold ${fc.impact >= 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {fc.impact >= 0 ? `+${fc.impact} Wh` : `${fc.impact} Wh`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Rule Callout */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-500 flex items-start gap-2">
              <HelpCircle className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
              <span>
                Target is continuous Watt-hours (Wh) for household appliances.
                Predictions reflect instantaneous 10-minute demand under the provided environmental state.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
