import React, { useState } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  HelpCircle, 
  Cpu, 
  TrendingDown, 
  ArrowUpRight, 
  Layers, 
  Clock, 
  ShieldAlert,
  Info
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
import { ModelMetric } from '../types';

interface ModelBenchmarksProps {
  selectedModelId: string;
  onSelectModel: (id: 'rf-baseline' | 'xgb-tuned' | 'lgbm-tuned' | 'ensemble-blended') => void;
}

export const ModelBenchmarks: React.FC<ModelBenchmarksProps> = ({
  selectedModelId,
  onSelectModel,
}) => {
  const [activeMetricTab, setActiveMetricTab] = useState<'r2' | 'mae' | 'rmse'>('r2');

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
              Empirical holdout comparison of Random Forest Regressor against gradient boosted trees (XGBoost, LightGBM)
              and weighted ensemble methods using standardized regression evaluation metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Regression Metric Formulation Banner */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-blue-700 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-950 leading-relaxed">
            <span className="font-bold">Regression Metric Formulation: </span>
            In regression analysis, R² represents the coefficient of determination rather than binary classification accuracy percentage.
            The model achieves an R² score of 0.5468, explaining approximately 54.68% of total variance in appliance electrical draw relative to the baseline mean model on the chronological holdout test set.
          </div>
        </div>
      </div>

      {/* Main Model Comparison Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Holdout Test Set Benchmark Matrix
            </h2>
            <p className="text-xs text-slate-500">
              All metrics computed on the identical unseen chronological test partition (20% holdout, 3,947 samples)
            </p>
          </div>
          <span className="text-xs text-slate-400">
            Target Unit: Watt-hours (Wh)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Model Architecture</th>
                <th className="px-4 py-3">Algorithm</th>
                <th className="px-4 py-3">MAE (Wh)</th>
                <th className="px-4 py-3">MSE (Wh²)</th>
                <th className="px-4 py-3">RMSE (Wh)</th>
                <th className="px-4 py-3">R² Score</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {MODEL_EVALUATION_METRICS.map((m) => {
                const isSelected = selectedModelId === m.id;
                return (
                  <tr 
                    key={m.id} 
                    className={`transition hover:bg-slate-50/80 ${
                      isSelected ? 'bg-emerald-50/40 font-medium' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{m.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{m.notes}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{m.algorithm}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{m.mae.toFixed(4)}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{m.mse.toFixed(2)}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{m.rmse.toFixed(4)}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-extrabold text-emerald-700">
                        {m.r2.toFixed(4)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{m.inference_speed}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                        m.status === 'baseline'
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
                        onClick={() => onSelectModel(m.id as any)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
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
              Select metric to inspect comparative distribution across model families
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-semibold gap-1">
            <button
              onClick={() => setActiveMetricTab('r2')}
              className={`rounded-md px-3 py-1 transition ${
                activeMetricTab === 'r2'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              R² Score (Higher is Better)
            </button>
            <button
              onClick={() => setActiveMetricTab('mae')}
              className={`rounded-md px-3 py-1 transition ${
                activeMetricTab === 'mae'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              MAE Wh (Lower is Better)
            </button>
            <button
              onClick={() => setActiveMetricTab('rmse')}
              className={`rounded-md px-3 py-1 transition ${
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
                domain={activeMetricTab === 'r2' ? [0.5, 0.62] : ['auto', 'auto']}
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

      {/* Metric Definitions & Theoretical Justifications */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-bold text-slate-900">MAE (Mean Absolute Error)</span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            The average magnitude of absolute prediction residuals in Watt-hours. Baseline RF exhibits <strong>32.03 Wh</strong>.
          </p>
          <div className="font-mono text-[10px] text-slate-400 pt-1">
            MAE = (1/n) Σ |yᵢ - ŷᵢ|
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-bold text-slate-900">RMSE (Root Mean Squared Error)</span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Penalizes larger error spikes more heavily than MAE. Expressed in the target unit Wh (Baseline: <strong>67.34 Wh</strong>).
          </p>
          <div className="font-mono text-[10px] text-slate-400 pt-1">
            RMSE = √[(1/n) Σ (yᵢ - ŷᵢ)²]
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-bold text-slate-900">R² Coefficient of Determination</span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Proportion of appliance load variance explained by model features relative to mean baseline (Baseline: <strong>0.5468</strong>).
          </p>
          <div className="font-mono text-[10px] text-slate-400 pt-1">
            R² = 1 - (SS_res / SS_tot)
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-bold text-slate-900">Time-Aware Validation</span>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Chronological split ensures future timestamps are not shuffled into training, preventing temporal lookahead leakage.
          </p>
          <div className="font-mono text-[10px] text-slate-400 pt-1">
            TimeSeriesSplit (K-Folds)
          </div>
        </div>
      </div>
    </div>
  );
};
