import React, { useState } from 'react';
import { 
  ListOrdered, 
  AlertTriangle, 
  HelpCircle, 
  Layers, 
  Thermometer, 
  Droplets, 
  Clock, 
  Zap, 
  Sun,
  ShieldCheck
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
import { FEATURE_IMPORTANCE_DATA } from '../data/mlData';
import { FeatureImportanceItem } from '../types';

export const FeatureImportance: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredFeatures = FEATURE_IMPORTANCE_DATA.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  const chartData = filteredFeatures.slice(0, 12).map((item) => ({
    name: item.feature,
    label: item.label,
    importance: Math.round(item.importance * 10000) / 100, // percentage format e.g. 19.84%
    category: item.category,
  }));

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'Usage': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Temporal': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Indoor Climate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Outdoor Weather': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Noise': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <ListOrdered className="h-3.5 w-3.5 text-emerald-600" />
                Random Forest MDI Analysis
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">28 Input Features Evaluated</span>
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Feature Importance & Sensor Reliance
            </h1>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl leading-relaxed">
              Evaluating the Gini / Mean Decrease in Impurity (MDI) across 200 decision trees to determine
              which environmental and temporal sensors provide the highest predictive contribution.
            </p>
          </div>
        </div>
      </div>

      {/* Critical Academic Non-Causation Banner */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Academic Principle — Predictive Reliance vs. Physical Causation: </span>
            Feature importance scores measure how much a feature reduces impurity (variance) across decision tree splits.
            It does <strong>NOT</strong> prove direct physical causation.
            Do not state: <em>&ldquo;Temperature causes appliance energy consumption.&rdquo;</em>
            The correct academic statement is:
            <em> &ldquo;Temperature is an important predictive feature according to the machine learning model.&rdquo;</em>
            Likewise, lighting (Wh) is a strong proxy for active occupant presence rather than a physical cause of appliance consumption.
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Usage', 'Temporal', 'Indoor Climate', 'Outdoor Weather', 'Noise'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold border transition ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Bar Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Mean Decrease in Impurity (MDI) Ranking
            </h2>
            <p className="text-xs text-slate-500">
              Normalized importance scores (%) derived from Random Forest Regressor
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-700 font-semibold">
            Top Predictor: lights (19.84%)
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              layout="vertical"
              margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis 
                type="number" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                unit="%"
                domain={[0, 22]}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '0.75rem', 
                  border: '1px solid #e2e8f0', 
                  fontSize: '12px' 
                }}
                formatter={(val: any, name: any, item: any) => [`${val}% MDI`, item.payload.label]}
              />
              <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell 
                    key={`cell-${entry.name}`} 
                    fill={idx === 0 ? '#059669' : idx === 1 ? '#0d9488' : idx < 4 ? '#10b981' : '#94a3b8'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Explanations Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Comprehensive Predictive Feature Directory
          </h3>
          <span className="text-xs text-slate-400">
            {filteredFeatures.length} Features Displayed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Feature Key</th>
                <th className="px-4 py-3">Sensor Name / Label</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Location / Source</th>
                <th className="px-4 py-3">MDI Importance</th>
                <th className="px-4 py-3">Predictive Rationale & Mechanism</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredFeatures.map((item) => (
                <tr key={item.feature} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{item.feature}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{item.label}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold border ${getCategoryBadgeColor(item.category)}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.sensor_location}</td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                    {(item.importance * 100).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-md">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
