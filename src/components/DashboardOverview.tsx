import React from 'react';
import { 
  Zap, 
  TrendingUp, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  Thermometer, 
  Droplets, 
  Sun, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Flame,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { EnvironmentalSensorInputs, PredictionResult, SimulationPreset } from '../types';
import { SIMULATION_PRESETS } from '../data/mlData';
import { formatWh, formatTemp, formatHumidity, getTierColor } from '../utils/formatters';
import { generate24HourSimulation } from '../services/forecastEngine';

interface DashboardOverviewProps {
  currentInputs: EnvironmentalSensorInputs;
  prediction: PredictionResult;
  onApplyPreset: (preset: SimulationPreset) => void;
  onNavigate: (view: string) => void;
  selectedModelId: 'rf-baseline' | 'xgb-tuned' | 'lgbm-tuned' | 'ensemble-blended';
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  currentInputs,
  prediction,
  onApplyPreset,
  onNavigate,
  selectedModelId,
}) => {
  const diurnalData = React.useMemo(() => {
    return generate24HourSimulation(currentInputs, selectedModelId);
  }, [currentInputs, selectedModelId]);

  const tierColors = getTierColor(prediction.consumption_level);

  return (
    <div className="space-y-6">
      {/* Top Banner / Problem Statement context */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Random Forest Baseline Active
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Holdout R² = 0.5468 (Variance Explained)</span>
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Household Appliance Load Dashboard
            </h1>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl leading-relaxed">
              Evaluating 10-minute micro-climatic sensor telemetry to anticipate household energy spikes,
              understand environmental interactions, and support proactive load scheduling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('predict')}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <span>Interactive Predictor</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onNavigate('simulation')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              24-Hour Simulation
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Current Predicted Wh */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Predicted Load (Wh)</span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold border ${tierColors.badge}`}>
              {prediction.consumption_level}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {prediction.predicted_wh}
            </span>
            <span className="text-xs font-semibold text-slate-500">Watt-hours</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>Confidence Interval (80%):</span>
            <span className="font-mono text-slate-700">{prediction.lower_bound} – {prediction.upper_bound} Wh</span>
          </div>
        </div>

        {/* 24-Hr Daily Projection */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">24-Hr Cumulative Load</span>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {prediction.daily_projected_kwh}
            </span>
            <span className="text-xs font-semibold text-slate-500">kWh / day</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
            <span>Est. Daily Cost (@$0.16/kWh):</span>
            <span className="font-semibold text-slate-700">${(prediction.daily_projected_kwh * 0.16).toFixed(2)}</span>
          </div>
        </div>

        {/* Baseline Model R² Metric */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Random Forest R² Score</span>
            <Cpu className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              0.5468
            </span>
            <span className="text-xs font-semibold text-emerald-700">54.68% Var</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2 leading-tight">
            Explains 54.68% target variance on holdout test set (not "accuracy %").
          </div>
        </div>

        {/* Holdout Error Metrics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Test Error Benchmarks</span>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">32.03</span>
              <span className="text-[10px] text-slate-400 block">MAE (Wh)</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">67.34</span>
              <span className="text-[10px] text-slate-400 block">RMSE (Wh)</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">4534</span>
              <span className="text-[10px] text-slate-400 block">MSE (Wh²)</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            Chronological 80/20 test split (N = 3,947)
          </div>
        </div>
      </div>

      {/* Scenario Presets Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Household Scenario Presets
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Click to load environmental conditions into the inference engine
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {SIMULATION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className="flex flex-col text-left rounded-xl border border-slate-200 p-2.5 hover:border-emerald-500 hover:bg-emerald-50/40 transition group"
            >
              <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900">
                {preset.name}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                {preset.description}
              </span>
              <span className="mt-2 inline-block text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 w-fit">
                {preset.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart: 24-Hour Projected Diurnal Load Curve */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              24-Hour Diurnal Load Simulation
            </h2>
            <p className="text-xs text-slate-500">
              Simulated hourly appliance demand curve across 24 hours under active micro-climate conditions
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
              Simulated Prediction (Wh)
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300"></span>
              Historical Dataset Baseline (Wh)
            </span>
          </div>
        </div>

        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={diurnalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="hour_label" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                axisLine={false}
                tickLine={false}
                unit=" Wh"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '0.75rem', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px'
                }}
                formatter={(value: any, name: any) => [
                  `${value} Wh`, 
                  name === 'predicted_wh' ? 'Simulated Prediction' : 'Historical Baseline'
                ]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="baseline_avg_wh" 
                stroke="#94a3b8" 
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1} 
                fill="url(#colorBase)" 
              />
              <Area 
                type="monotone" 
                dataKey="predicted_wh" 
                stroke="#059669" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorPred)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-slate-400" />
            Diurnal curve captures natural morning (07:30) and evening peak (19:30) occupancy cycles.
          </span>
          <button 
            onClick={() => onNavigate('simulation')}
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Open Full Simulation Playground →
          </button>
        </div>
      </div>

      {/* Two Column Grid: Environmental Sensor Telemetry & Feature Contributions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Sensor Telemetry Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Active Environmental Telemetry
              </h3>
              <p className="text-[11px] text-slate-500">
                Primary indoor micro-climates and outdoor meteorological station
              </p>
            </div>
            <button
              onClick={() => onNavigate('predict')}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              Adjust Inputs →
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {/* Kitchen */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-[10px] font-bold uppercase text-slate-400">Kitchen (T1/RH1)</span>
              <div className="mt-1 flex items-baseline gap-1 text-sm font-bold text-slate-800">
                {formatTemp(currentInputs.T1)}
              </div>
              <div className="text-[11px] text-slate-500">{formatHumidity(currentInputs.RH_1)} RH</div>
            </div>

            {/* Laundry */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-[10px] font-bold uppercase text-slate-400">Laundry (T3/RH3)</span>
              <div className="mt-1 flex items-baseline gap-1 text-sm font-bold text-slate-800">
                {formatTemp(currentInputs.T3)}
              </div>
              <div className="text-[11px] text-slate-500">{formatHumidity(currentInputs.RH_3)} RH</div>
            </div>

            {/* Living Room */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-[10px] font-bold uppercase text-slate-400">Living Room (T2/RH2)</span>
              <div className="mt-1 flex items-baseline gap-1 text-sm font-bold text-slate-800">
                {formatTemp(currentInputs.T2)}
              </div>
              <div className="text-[11px] text-slate-500">{formatHumidity(currentInputs.RH_2)} RH</div>
            </div>

            {/* Outdoor Weather */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-[10px] font-bold uppercase text-slate-400">Outdoor (T_out)</span>
              <div className="mt-1 flex items-baseline gap-1 text-sm font-bold text-slate-800">
                {formatTemp(currentInputs.T_out)}
              </div>
              <div className="text-[11px] text-slate-500">{formatHumidity(currentInputs.RH_out)} RH</div>
            </div>

            {/* Lights */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-[10px] font-bold uppercase text-slate-400">Lighting Energy</span>
              <div className="mt-1 flex items-baseline gap-1 text-sm font-bold text-slate-800">
                {currentInputs.lights} Wh
              </div>
              <div className="text-[11px] text-slate-500">Occupant activity proxy</div>
            </div>

            {/* Pressure & Wind */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-[10px] font-bold uppercase text-slate-400">Atmosphere</span>
              <div className="mt-1 flex items-baseline gap-1 text-sm font-bold text-slate-800">
                {currentInputs.Press_mm_hg.toFixed(0)} mmHg
              </div>
              <div className="text-[11px] text-slate-500">{currentInputs.Windspeed.toFixed(1)} m/s Wind</div>
            </div>
          </div>
        </div>

        {/* Feature Attribution Drivers */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Model Prediction Drivers
              </h3>
              <p className="text-[11px] text-slate-500">
                Estimated contribution to load relative to ~45 Wh baseline standby
              </p>
            </div>
            <button
              onClick={() => onNavigate('importance')}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              All Features →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {prediction.feature_contributions.map((fc) => (
              <div key={fc.feature} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{fc.label}</span>
                  <span className={`font-mono font-bold ${fc.impact >= 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {fc.impact >= 0 ? `+${fc.impact} Wh` : `${fc.impact} Wh`}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${fc.impact >= 0 ? 'bg-emerald-600' : 'bg-slate-400'}`}
                    style={{ width: `${Math.min(100, Math.max(10, Math.abs(fc.impact) * 0.8))}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">{fc.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 flex items-start gap-2">
            <Info className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <span>
              Note: Feature importance indicates predictive reliance, not direct causation.
              Lighting does not cause appliance consumption; it strongly correlates with active human presence.
            </span>
          </div>
        </div>
      </div>

      {/* Energy Management Decision Support Card */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-950">
                Energy Management Decision Support
              </h3>
              <button 
                onClick={() => onNavigate('energy_mgmt')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950"
              >
                View Full Advisory →
              </button>
            </div>
            <p className="mt-1 text-xs text-emerald-900/80 leading-relaxed">
              {prediction.predicted_wh > 180 
                ? 'High consumption period anticipated. Running laundry appliances (dryer, washing machine) or heavy oven loads during this period can trigger peak demand charges. Consider shifting flexible loads to early afternoon (13:00) or off-peak night (after 22:00).'
                : 'Current household operational load is within efficient baseline parameters. Refrigerator cyclic cooling and standby electronics represent the primary continuous base draw.'}
            </p>
            <p className="mt-2 text-[10px] text-emerald-700/70 italic">
              *System provides decision support and predictive analytics. It does not automatically cut power circuits or modify physical electrical wiring.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
