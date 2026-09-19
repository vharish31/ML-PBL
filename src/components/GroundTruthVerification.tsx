import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  HelpCircle, 
  Check, 
  Activity,
  FileSpreadsheet
} from 'lucide-react';
import { VERIFICATION_SAMPLES } from '../data/mlData';
import { VerificationSample, EnvironmentalSensorInputs } from '../types';

interface GroundTruthVerificationProps {
  onLoadSample: (sample: VerificationSample) => void;
  onNavigate: (view: string) => void;
}

export const GroundTruthVerification: React.FC<GroundTruthVerificationProps> = ({
  onLoadSample,
  onNavigate,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const handleTestSample = (sample: VerificationSample) => {
    setSelectedCaseId(sample.id);
    onLoadSample(sample);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Holdout Test Set Verification
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Empirical Ground Truth Comparison</span>
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Prediction Verification & Residual Audit
            </h1>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl leading-relaxed">
              Verifying model predictions against ground truth holdout observations from the KAG energy dataset.
              Analyze residual deviations, outlier spikes, and evaluate performance across different time windows.
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Sample High Precision Rate</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">75.0%</div>
          <span className="text-[11px] text-emerald-700 font-semibold">6 of 8 samples within &lt;15% error margin</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Mean Test Residual</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">26.1 Wh</div>
          <span className="text-[11px] text-slate-500">Aligned with global test MAE (32.03 Wh)</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Peak Spike Variance</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">Max -107.9 Wh</div>
          <span className="text-[11px] text-slate-400">Occurs during unmetered short burst spikes</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Representative Holdout Verification Cases
            </h3>
            <p className="text-xs text-slate-500">
              Click &ldquo;Inspect Case&rdquo; to load the exact conditions into the live predictor
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Source: KAG_energydata_complete.csv
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Case ID</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Conditions</th>
                <th className="px-4 py-3">Ground Truth (Wh)</th>
                <th className="px-4 py-3">Model Prediction (Wh)</th>
                <th className="px-4 py-3">Residual Error</th>
                <th className="px-4 py-3">Error %</th>
                <th className="px-4 py-3">Tolerance Band</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {VERIFICATION_SAMPLES.map((sample) => {
                const isSelected = selectedCaseId === sample.id;
                return (
                  <tr 
                    key={sample.id} 
                    className={`transition hover:bg-slate-50 ${
                      isSelected ? 'bg-emerald-50/40 font-medium' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{sample.id}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{sample.timestamp}</td>
                    <td className="px-4 py-3.5 text-slate-600">
                      <div>T_out: {sample.t_out.toFixed(1)}°C • RH_out: {sample.rh_out.toFixed(0)}%</div>
                      <div className="text-[10px] text-slate-400">Lights: {sample.lights} Wh • Hour: {sample.hour}:00</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-extrabold text-slate-900">
                      {sample.actual_wh} Wh
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-700">
                      {sample.predicted_wh} Wh
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      {sample.error_wh > 0 ? `+${sample.error_wh}` : sample.error_wh} Wh
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold">
                      {sample.error_pct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                        sample.accuracy_band.startsWith('High')
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {sample.accuracy_band}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          handleTestSample(sample);
                          onNavigate('predict');
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analysis Note on Residual Errors */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <HelpCircle className="h-4 w-4 text-slate-500" />
          <span>Why Do Large Spikes (e.g. Case 06: 420 Wh vs 312 Wh) Occur?</span>
        </div>
        <p className="leading-relaxed">
          In aggregate household datasets, high electrical spikes (e.g., an electric oven heating element or clothes iron drawing 2,000 W for 8 minutes)
          occur without immediate environmental temperature rise because the heat hasn&apos;t diffused into ambient air sensors yet.
          The regression trees dampen extreme single-point outliers to prevent overfitting on noisy spikes, resulting in a moderate underestimate of extreme bursts while maintaining high fidelity across continuous baseline operations.
        </p>
      </div>
    </div>
  );
};
