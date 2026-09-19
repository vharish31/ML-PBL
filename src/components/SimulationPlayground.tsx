import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  Info, 
  Clock, 
  Zap, 
  Calendar, 
  Thermometer, 
  Sun, 
  Download,
  AlertTriangle,
  Flame,
  CheckCircle2
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
import { EnvironmentalSensorInputs, SimulationPreset } from '../types';
import { SIMULATION_PRESETS } from '../data/mlData';
import { generate24HourSimulation } from '../services/forecastEngine';
import { formatWh, formatHour } from '../utils/formatters';

interface SimulationPlaygroundProps {
  currentInputs: EnvironmentalSensorInputs;
  onInputChange: (newInputs: EnvironmentalSensorInputs) => void;
  selectedModelId: 'rf-baseline' | 'xgb-tuned' | 'lgbm-tuned' | 'ensemble-blended';
}

export const SimulationPlayground: React.FC<SimulationPlaygroundProps> = ({
  currentInputs,
  onInputChange,
  selectedModelId,
}) => {
  const [simulationOutdoorTemp, setSimulationOutdoorTemp] = useState<number>(currentInputs.T_out);
  const [simulationLights, setSimulationLights] = useState<number>(currentInputs.lights);
  const [simulationIsWeekend, setSimulationIsWeekend] = useState<boolean>(currentInputs.is_weekend);
  const [kitchenActivityMod, setKitchenActivityMod] = useState<number>(0);
  const [laundryActivityMod, setLaundryActivityMod] = useState<number>(0);

  // Compute 24-hour simulation data
  const simulatedInputs: EnvironmentalSensorInputs = useMemo(() => {
    return {
      ...currentInputs,
      T_out: simulationOutdoorTemp,
      lights: simulationLights,
      is_weekend: simulationIsWeekend,
      day_of_week: simulationIsWeekend ? 5 : 2,
      T1: currentInputs.T1 + (kitchenActivityMod * 1.5),
      RH_1: currentInputs.RH_1 + (kitchenActivityMod * 6.0),
      T3: currentInputs.T3 + (laundryActivityMod * 2.0),
      RH_3: currentInputs.RH_3 + (laundryActivityMod * 8.0),
    };
  }, [currentInputs, simulationOutdoorTemp, simulationLights, simulationIsWeekend, kitchenActivityMod, laundryActivityMod]);

  const simulationPoints = useMemo(() => {
    return generate24HourSimulation(simulatedInputs, selectedModelId);
  }, [simulatedInputs, selectedModelId]);

  // Derived peak and valley
  const { peakPoint, valleyPoint, totalKwh } = useMemo(() => {
    let peak = simulationPoints[0];
    let valley = simulationPoints[0];
    let sumWh = 0;

    for (const pt of simulationPoints) {
      sumWh += pt.predicted_wh;
      if (pt.predicted_wh > peak.predicted_wh) peak = pt;
      if (pt.predicted_wh < valley.predicted_wh) valley = pt;
    }

    return {
      peakPoint: peak,
      valleyPoint: valley,
      totalKwh: Math.round((sumWh / 1000) * 100) / 100,
    };
  }, [simulationPoints]);

  const handleApplyPreset = (preset: SimulationPreset) => {
    onInputChange({
      ...currentInputs,
      ...preset.inputs,
    });
    if (preset.inputs.T_out !== undefined) setSimulationOutdoorTemp(preset.inputs.T_out);
    if (preset.inputs.lights !== undefined) setSimulationLights(preset.inputs.lights);
    if (preset.inputs.is_weekend !== undefined) setSimulationIsWeekend(preset.inputs.is_weekend);
  };

  const handleExportCSV = () => {
    const headers = ['Hour', 'Time_Label', 'Predicted_Wh', 'Historical_Baseline_Wh', 'Outdoor_Temp_C', 'Lower_Bound_Wh', 'Upper_Bound_Wh'];
    const rows = simulationPoints.map((p) => [
      p.hour,
      `"${p.hour_label}"`,
      p.predicted_wh,
      p.baseline_avg_wh,
      p.outdoor_temp,
      p.low_wh,
      p.high_wh
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `24h_appliance_simulation_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <Sliders className="h-3.5 w-3.5 text-emerald-600" />
                Scenario Simulation Engine
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">24-Hour Diurnal Projection</span>
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              24-Hour Diurnal Simulation Playground
            </h1>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl leading-relaxed">
              Experiment with prospective environmental conditions, outdoor thermal dynamics, and occupant schedules.
              Simulate full 24-hour demand curves to model peak load timing and off-peak valleys.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Prominent Academic Simulation Disclaimer Banner */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold">Academic Simulation Protocol Note: </span>
            A genuine multi-step future forecast requires authentic future input variables.
            In this demonstration, the 24-hour curve is a <em>simulation</em> conditioned on user-defined environmental parameters
            and diurnal solar progressions. The system does not falsely claim connection to live external weather forecasts unless an external weather API is configured.
          </div>
        </div>
      </div>

      {/* Presets Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
          Quick Simulation Scenarios:
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {SIMULATION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className="flex flex-col text-left rounded-xl border border-slate-200 p-2.5 hover:border-emerald-500 hover:bg-emerald-50/40 transition group"
            >
              <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900">
                {preset.name}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                {preset.description}
              </span>
              <span className="mt-2 inline-block text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 w-fit">
                {preset.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main 24-Hour Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Simulated 24-Hour Diurnal Appliance Profile
            </h2>
            <p className="text-xs text-slate-500">
              Hourly resolution (00:00 to 23:00) comparing simulated response against empirical dataset average
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
              Simulated Forecast (Wh)
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300"></span>
              Historical Average (Wh)
            </span>
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={simulationPoints} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="simPred" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="simBase" x1="0" y1="0" x2="0" y2="1">
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
                  name === 'predicted_wh' ? 'Simulated Forecast' : 'Historical Mean'
                ]}
                labelFormatter={(label) => `Hour: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="baseline_avg_wh" 
                stroke="#94a3b8" 
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1} 
                fill="url(#simBase)" 
              />
              <Area 
                type="monotone" 
                dataKey="predicted_wh" 
                stroke="#059669" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#simPred)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 3 Metric Badges: Projected Peak, Valley, and Total Daily */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-3 border-t border-slate-100">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Projected Peak Period</span>
              <span className="text-sm font-bold text-slate-900">
                {peakPoint.hour_label} • {peakPoint.predicted_wh} Wh
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Off-Peak Baseline Valley</span>
              <span className="text-sm font-bold text-slate-900">
                {valleyPoint.hour_label} • {valleyPoint.predicted_wh} Wh
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">24-Hour Projected Total</span>
              <span className="text-sm font-bold text-slate-900">
                {totalKwh} kWh / day (${(totalKwh * 0.16).toFixed(2)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Parameter Sliders */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900">
          Simulation Environmental Sliders
        </h3>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Outdoor Temperature Slider */}
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">Mean Outdoor Temp (°C)</span>
              <span className="font-mono font-bold text-emerald-700">{simulationOutdoorTemp.toFixed(1)}°C</span>
            </div>
            <input
              type="range"
              min="-5"
              max="28"
              step="0.5"
              value={simulationOutdoorTemp}
              onChange={(e) => setSimulationOutdoorTemp(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Affects thermal loss and auxiliary boiler load</span>
          </div>

          {/* Base Lighting Slider */}
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">Lighting Baseline (Wh)</span>
              <span className="font-mono font-bold text-emerald-700">{simulationLights} Wh</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="10"
              value={simulationLights}
              onChange={(e) => setSimulationLights(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Active human occupancy proxy</span>
          </div>

          {/* Weekend Toggle */}
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">Schedule Profile</span>
              <span className="font-mono font-bold text-slate-700">
                {simulationIsWeekend ? 'Weekend' : 'Weekday'}
              </span>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSimulationIsWeekend(false)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold border transition ${
                  !simulationIsWeekend
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Weekday
              </button>
              <button
                type="button"
                onClick={() => setSimulationIsWeekend(true)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold border transition ${
                  simulationIsWeekend
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Weekend
              </button>
            </div>
            <span className="text-[10px] text-slate-400 block">Weekend maintains higher daytime occupancy</span>
          </div>

          {/* Kitchen Activity Modifier */}
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">Kitchen Activity Modifier</span>
              <span className="font-mono font-bold text-slate-700">
                {kitchenActivityMod > 0 ? `+${kitchenActivityMod}` : kitchenActivityMod}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={kitchenActivityMod}
              onChange={(e) => setKitchenActivityMod(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">
              Simulates stove, kettle & dishwasher heat/humidity
            </span>
          </div>

          {/* Laundry Activity Modifier */}
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">Laundry Dryer Modifier</span>
              <span className="font-mono font-bold text-slate-700">
                {laundryActivityMod > 0 ? `+${laundryActivityMod}` : laundryActivityMod}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={laundryActivityMod}
              onChange={(e) => setLaundryActivityMod(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">
              Simulates electric clothes tumble dryer cycle
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
