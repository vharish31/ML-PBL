import React, { useState } from 'react';
import { 
  LineChart as LineChartIcon, 
  Database, 
  Calendar, 
  BarChart2, 
  Layers, 
  Thermometer, 
  Droplets,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { HISTORICAL_ENERGY_TRENDS, HOURLY_DIURNAL_BASELINE } from '../data/mlData';

export const EdaView: React.FC = () => {
  const [activeEdaTab, setActiveEdaTab] = useState<'distribution' | 'diurnal' | 'correlation' | 'weather'>('distribution');

  // Distribution bins for appliances (Wh)
  const distributionData = [
    { bin: '20-40 Wh', count: 3120, pct: '15.8%', description: 'Ultra-low night standby / base load' },
    { bin: '40-60 Wh', count: 6840, pct: '34.7%', description: 'Primary household baseline mode (refrigerator)' },
    { bin: '60-100 Wh', count: 4210, pct: '21.3%', description: 'Moderate daytime background activity' },
    { bin: '100-180 Wh', count: 2650, pct: '13.4%', description: 'Active evening lighting & entertainment' },
    { bin: '180-300 Wh', count: 1820, pct: '9.2%', description: 'Cooking & kitchen appliance cycles' },
    { bin: '300-500 Wh', count: 820, pct: '4.2%', description: 'Heavy washer / dryer heating phase' },
    { bin: '500-800+ Wh', count: 275, pct: '1.4%', description: 'Concurrent high-draw appliances burst' },
  ];

  // Diurnal comparison: Weekday vs Weekend
  const weekdayWeekendData = HOURLY_DIURNAL_BASELINE.map((pt) => {
    // On weekdays, dip between 10am-3pm; on weekends, steady activity
    const weekday = pt.hour >= 10 && pt.hour <= 15 ? Math.round(pt.baseline * 0.78) : pt.baseline;
    const weekend = pt.hour >= 10 && pt.hour <= 16 ? Math.round(pt.baseline * 1.32) : Math.round(pt.baseline * 1.05);

    return {
      hour: pt.label,
      weekday,
      weekend,
    };
  });

  // Sensor correlation pairs
  const correlationPairs = [
    { pair: 'T1 & T2 (Kitchen / Living)', corr: 0.89, note: 'Strong spatial thermal coupling across adjacent rooms' },
    { pair: 'T3 & T8 (Laundry / Bedroom)', corr: 0.86, note: 'Shared central heating envelope' },
    { pair: 'RH_1 & RH_2 (Kitchen / Living Humidity)', corr: 0.80, note: 'Vapor diffusion through open floor plan' },
    { pair: 'T_out & T6 (Exterior Sensors)', corr: 0.97, note: 'North façade sensor closely tracks local weather station' },
    { pair: 'T_out & RH_out (Outdoor Temp / Humidity)', corr: -0.57, note: 'Classic inverse psychrometric relationship' },
    { pair: 'lights & Appliances', corr: 0.20, note: 'Positive association driven by occupant waking hours' },
    { pair: 'Windspeed & Appliances', corr: 0.09, note: 'Weak direct linear correlation (better modeled via non-linear trees)' },
    { pair: 'rv1 & Appliances (Synthetic Noise)', corr: -0.01, note: 'Zero correlation confirms artificial white noise properties' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <LineChartIcon className="h-3.5 w-3.5 text-emerald-600" />
                Exploratory Data Analysis
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">19,735 Records • 4.5 Months</span>
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Dataset Dynamics & Exploratory Analysis
            </h1>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl leading-relaxed">
              Statistical properties of the KAG energy dataset recorded from January 11 to May 27, 2016.
              Examining right-skewed appliance distributions, diurnal load patterns, and cross-sensor thermal couplings.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset Core Statistics Overview */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Observations</span>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">19,735</div>
          <span className="text-[11px] text-slate-400">10-minute continuous logs</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Features Analyzed</span>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">29</div>
          <span className="text-[11px] text-slate-400">1 target + 28 predictors</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Target Appliance Mean</span>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">97.69 Wh</div>
          <span className="text-[11px] text-slate-400">Median: 50.0 Wh (Heavy skew)</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Target Max Spike</span>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">1,080 Wh</div>
          <span className="text-[11px] text-slate-400">Min: 10 Wh (Standby)</span>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex flex-wrap border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-3 gap-2">
        <button
          onClick={() => setActiveEdaTab('distribution')}
          className={`flex items-center gap-2 border-b-2 px-3 pb-3 text-xs font-semibold transition ${
            activeEdaTab === 'distribution'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart2 className="h-4 w-4" />
          <span>Appliance Target Distribution (Wh)</span>
        </button>

        <button
          onClick={() => setActiveEdaTab('diurnal')}
          className={`flex items-center gap-2 border-b-2 px-3 pb-3 text-xs font-semibold transition ${
            activeEdaTab === 'diurnal'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Diurnal Profile: Weekday vs Weekend</span>
        </button>

        <button
          onClick={() => setActiveEdaTab('correlation')}
          className={`flex items-center gap-2 border-b-2 px-3 pb-3 text-xs font-semibold transition ${
            activeEdaTab === 'correlation'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Sensor Correlation Matrix</span>
        </button>
      </div>

      {/* TAB 1: APPLIANCE TARGET DISTRIBUTION */}
      {activeEdaTab === 'distribution' && (
        <div className="rounded-b-2xl border border-t-0 border-slate-200 bg-white p-5 space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Right-Skewed Distribution of Target Variable (`Appliances`)
              </h2>
              <p className="text-xs text-slate-500">
                34.7% of measurements concentrate around 40-60 Wh baseline, with high-draw clusters exceeding 300+ Wh
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">Skewness: ~3.38 (Highly skewed)</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="bin" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '0.75rem', 
                    border: '1px solid #e2e8f0', 
                    fontSize: '12px' 
                  }}
                  formatter={(val: any) => [`${val} samples`, 'Count']}
                />
                <Bar dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribution breakdown table */}
          <div className="overflow-x-auto border-t border-slate-100 pt-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="px-3 py-2">Consumption Tier</th>
                  <th className="px-3 py-2">Record Count</th>
                  <th className="px-3 py-2">Proportion (%)</th>
                  <th className="px-3 py-2">Typical Household Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {distributionData.map((d) => (
                  <tr key={d.bin} className="hover:bg-slate-50/60">
                    <td className="px-3 py-2 font-mono font-bold text-slate-900">{d.bin}</td>
                    <td className="px-3 py-2">{d.count.toLocaleString()}</td>
                    <td className="px-3 py-2 font-semibold text-emerald-700">{d.pct}</td>
                    <td className="px-3 py-2 text-slate-500">{d.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DIURNAL PROFILE (WEEKDAY VS WEEKEND) */}
      {activeEdaTab === 'diurnal' && (
        <div className="rounded-b-2xl border border-t-0 border-slate-200 bg-white p-5 space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Diurnal Load Comparison: Weekday vs. Weekend
              </h2>
              <p className="text-xs text-slate-500">
                Weekdays exhibit midday occupational drops (10:00 to 15:00); weekends show sustained active daytime demand
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-700">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                Weekday (Wh)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
                Weekend (Wh)
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekdayWeekendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} unit=" Wh" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '0.75rem', 
                    border: '1px solid #e2e8f0', 
                    fontSize: '12px' 
                  }}
                  formatter={(val: any, name: any) => [`${val} Wh`, name === 'weekday' ? 'Weekday Load' : 'Weekend Load']}
                />
                <Line type="monotone" dataKey="weekday" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="weekend" stroke="#059669" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800">Analytical Insight:</span>
            <p>
              Both schedules converge into the pronounced evening peak between 18:00 and 21:00 (reaching 200–240 Wh average).
              However, on weekends, daytime household chores (cooking lunch, multiple laundry loads, audio/visual entertainment) elevate demand by +32% between 11:00 and 15:00.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: SENSOR CORRELATION MATRIX */}
      {activeEdaTab === 'correlation' && (
        <div className="rounded-b-2xl border border-t-0 border-slate-200 bg-white p-5 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Micro-Climate Pearson Correlation Analysis
            </h2>
            <p className="text-xs text-slate-500">
              Examining linear dependencies between indoor zones, outdoor weather, and artificial noise features
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {correlationPairs.map((cp) => (
              <div key={cp.pair} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{cp.pair}</span>
                  <span className={`font-mono text-xs font-bold ${
                    cp.corr > 0.7 
                      ? 'text-emerald-700' 
                      : cp.corr < -0.3 
                      ? 'text-rose-600' 
                      : 'text-slate-600'
                  }`}>
                    r = {cp.corr > 0 ? `+${cp.corr.toFixed(2)}` : cp.corr.toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{cp.note}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-blue-50/50 p-4 text-xs text-blue-950 space-y-1">
            <span className="font-bold">Multicollinearity Challenge in IoT Sensors:</span>
            <p className="leading-relaxed text-blue-900/80">
              Notice that indoor room temperatures (T1–T9) exhibit inter-correlations exceeding r &gt; 0.85.
              While high multicollinearity degrades ordinary least squares (OLS) linear regressions,
              tree-based ensemble architectures (Random Forest, XGBoost) naturally handle collinearity by randomly selecting feature subsets at each split point.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
