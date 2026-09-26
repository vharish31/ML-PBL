import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  HelpCircle, 
  Cpu, 
  TrendingDown, 
  TrendingUp,
  ArrowUpRight, 
  Layers, 
  Clock, 
  ShieldAlert,
  Info,
  DollarSign,
  Activity,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { MODEL_EVALUATION_METRICS } from '../data/mlData';
import { EnvironmentalSensorInputs, ModelMetric, SupportedModelId } from '../types';
import { getModelFinalPredictions, runModelInference } from '../services/forecastEngine';

interface ModelBenchmarksProps {
  selectedModelId: SupportedModelId;
  onSelectModel: (id: SupportedModelId) => void;
  currentInputs: EnvironmentalSensorInputs;
}

export const ModelBenchmarks: React.FC<ModelBenchmarksProps> = ({
  selectedModelId,
  onSelectModel,
  currentInputs,
}) => {
  const [activeMetricTab, setActiveMetricTab] = useState<'r2' | 'mae' | 'rmse'>('r2');

  // Compute live final predictions for all models
  const livePredictions = useMemo(() => {
    return getModelFinalPredictions(currentInputs);
  }, [currentInputs]);

  // Active model full inference result
  const activeModelPrediction = useMemo(() => {
    return runModelInference(currentInputs, selectedModelId);
  }, [currentInputs, selectedModelId]);

  const activeModelMeta = useMemo(() => {
    return MODEL_EVALUATION_METRICS.find((m) => m.id === selectedModelId) || MODEL_EVALUATION_METRICS[0];
  }, [selectedModelId]);

  const chartData = MODEL_EVALUATION_METRICS.map((m) => ({
    name: m.algorithm,
    r2: m.r2,
    mae: m.mae,
    rmse: m.rmse,
    id: m.id,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />
                Holdout Validation Benchmarks
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Chronological 80/20 Split (N = 3,947)</span>
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Model Evaluation & Algorithm Comparison
            </h1>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl leading-relaxed">
              Empirical holdout comparison across 6 statistical and machine learning algorithms: Random Forest, XGBoost,
              LightGBM, Weighted Ensemble, Multiple Linear Regression, and Logistic Regression.
            </p>
          </div>
        </div>
      </div>

      {/* Active Model Deep Analysis Card with Live Final Prediction */}
      <div className="rounded-2xl border-2 border-emerald-500/80 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Active Model In-Depth Analysis
                </span>
                <span className="rounded-full bg-emerald-600 px-2 py-0.2 text-[10px] font-bold text-white">
                  Active
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900">
                {activeModelMeta.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Algorithm Family:</span>
            <span className="font-mono text-xs font-bold text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
              {activeModelMeta.algorithm}
            </span>
          </div>
        </div>

        {/* Final Prediction Metrics Strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-emerald-200/80 bg-white p-3.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Final Prediction Value
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">
                {activeModelPrediction.predicted_wh}
              </span>
              <span className="text-xs font-bold text-slate-600">Wh</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
              Current live telemetry state
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Consumption Level
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${
                activeModelPrediction.consumption_level === 'Peak'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : activeModelPrediction.consumption_level === 'Elevated'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {activeModelPrediction.consumption_level} Demand
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Bounds: [{activeModelPrediction.lower_bound} - {activeModelPrediction.upper_bound} Wh]
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Cost & Daily Energy
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-900">
                ${activeModelPrediction.hourly_cost_estimate_usd}
              </span>
              <span className="text-xs text-slate-500">/hr</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
              {activeModelPrediction.daily_projected_kwh} kWh/day projected
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Holdout R² & Speed
            </span>
            <div className="mt-1 flex items-baseline gap-1.5 font-mono">
              <span className="text-lg font-extrabold text-emerald-700">
                R² {activeModelMeta.r2.toFixed(4)}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Latency: {activeModelMeta.inference_speed} • Train: {activeModelMeta.training_time}
            </span>
          </div>
        </div>

        {/* Logistic Regression Specific Probability Banner if active */}
        {activeModelPrediction.surge_probability !== undefined && (
          <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-700" />
              <span className="font-semibold text-purple-900">
                Sigmoid Peak Surge Probability P(Load ≥ 120 Wh):
              </span>
            </div>
            <span className="font-mono font-black text-sm text-purple-950 bg-white px-2 py-0.5 rounded border border-purple-200">
              {activeModelPrediction.surge_probability}% Probability
            </span>
          </div>
        )}

        {/* Hyperparameters & Implementation Details */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 text-xs space-y-2">
          <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
            Architecture Hyperparameters & Empirical Properties
          </span>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            {Object.entries(activeModelMeta.hyperparameters).map(([key, val]) => (
              <span key={key} className="rounded-md bg-slate-50 border border-slate-200 px-2 py-1 text-slate-700">
                <strong className="text-slate-900">{key}:</strong> {String(val)}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 italic pt-1">
            {activeModelMeta.notes}
          </p>
        </div>
      </div>

      {/* Main Model Comparison Table with Live Final Prediction Column */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Holdout Test Set Benchmark Matrix & Final Prediction Analysis
            </h2>
            <p className="text-xs text-slate-500">
              Comparative matrix with real-time calculated final prediction values on the current telemetry input state
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Target: Watt-hours (Wh) • 6 Models
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Model Architecture</th>
                <th className="px-4 py-3">Algorithm</th>
                <th className="px-4 py-3 bg-emerald-50/60 text-emerald-950 font-extrabold border-x border-emerald-100">
                  Final Prediction Value
                </th>
                <th className="px-4 py-3">MAE (Wh)</th>
                <th className="px-4 py-3">RMSE (Wh)</th>
                <th className="px-4 py-3">R² Score</th>
                <th className="px-4 py-3">Speed</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {MODEL_EVALUATION_METRICS.map((m) => {
                const isSelected = selectedModelId === m.id;
                const mPred = livePredictions[m.id as SupportedModelId];

                return (
                  <tr 
                    key={m.id} 
                    className={`transition hover:bg-slate-50/80 ${
                      isSelected ? 'bg-emerald-50/40 font-medium' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{m.name}</span>
                        {isSelected && (
                          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{m.notes}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{m.algorithm}</td>

                    {/* Final Prediction Value Column */}
                    <td className="px-4 py-3.5 bg-emerald-50/30 border-x border-emerald-100">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-black text-emerald-950">
                          {mPred ? `${mPred.predicted_wh} Wh` : '--'}
                        </span>
                        {mPred?.surge_probability !== undefined && (
                          <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-1 py-0.2 rounded border border-purple-200">
                            P: {mPred.surge_probability}%
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {mPred ? `[${mPred.lower_bound} - ${mPred.upper_bound}]` : ''}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{m.mae.toFixed(2)}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{m.rmse.toFixed(2)}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-extrabold text-emerald-700">
                        {m.r2.toFixed(4)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{m.inference_speed}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                        m.status === 'state-of-the-art'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : m.status === 'baseline'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : m.status === 'optimized'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {m.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => onSelectModel(m.id as SupportedModelId)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Metric Comparison Charts */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Comparative Performance Visualization
            </h3>
            <p className="text-xs text-slate-500">
              Cross-model distribution comparing tree ensembles against Linear and Logistic baselines
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-semibold gap-1">
            <button
              onClick={() => setActiveMetricTab('r2')}
              className={`rounded-md px-3 py-1 transition cursor-pointer ${
                activeMetricTab === 'r2'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              R² Score (Higher is Better)
            </button>
            <button
              onClick={() => setActiveMetricTab('mae')}
              className={`rounded-md px-3 py-1 transition cursor-pointer ${
                activeMetricTab === 'mae'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              MAE Wh (Lower is Better)
            </button>
            <button
              onClick={() => setActiveMetricTab('rmse')}
              className={`rounded-md px-3 py-1 transition cursor-pointer ${
                activeMetricTab === 'rmse'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              RMSE Wh (Lower is Better)
            </button>
          </div>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                axisLine={false}
                domain={activeMetricTab === 'r2' ? [0, 0.65] : ['auto', 'auto']}
                unit={activeMetricTab === 'r2' ? '' : ' Wh'}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '0.75rem', 
                  border: '1px solid #e2e8f0', 
                  fontSize: '12px' 
                }} 
              />
              <Bar 
                dataKey={activeMetricTab} 
                radius={[6, 6, 0, 0]}
              >
                {chartData.map((entry) => (
                  <Cell 
                    key={`cell-${entry.id}`} 
                    fill={entry.id === selectedModelId ? '#059669' : '#94a3b8'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metric Definitions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-bold text-slate-900">MAE (Mean Absolute Error)</span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            The average magnitude of absolute prediction residuals in Watt-hours. Baseline RF exhibits <strong>32.03 Wh</strong>, vs. <strong>51.22 Wh</strong> for Linear.
          </p>
          <div className="font-mono text-[10px] text-slate-400 pt-1">
            MAE = (1/n) Σ |yᵢ - ŷᵢ|
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-bold text-slate-900">RMSE (Root Mean Squared Error)</span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Penalizes larger error spikes more heavily than MAE. Expressed in target unit Wh (Baseline: <strong>67.34 Wh</strong>).
          </p>
          <div className="font-mono text-[10px] text-slate-400 pt-1">
            RMSE = √[(1/n) Σ (yᵢ - ŷᵢ)²]
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-bold text-slate-900">R² Coefficient of Determination</span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Variance explained by model features. Tree models achieve 0.54-0.59, far exceeding Linear Regression (0.165).
          </p>
          <div className="font-mono text-[10px] text-slate-400 pt-1">
            R² = 1 - (SS_res / SS_tot)
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-bold text-slate-900">Time-Aware Chronological Validation</span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Split ensures future timestamps are not shuffled into training, preventing temporal lookahead data leakage.
          </p>
          <div className="font-mono text-[10px] text-slate-400 pt-1">
            80/20 Chronological Holdout (3,947)
          </div>
        </div>
      </div>
    </div>
  );
};
