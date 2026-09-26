import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Zap, 
  Bell, 
  Cpu, 
  PlayCircle, 
  Search, 
  Menu, 
  ChevronDown, 
  Check, 
  BarChart3, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { EnvironmentalSensorInputs, SupportedModelId } from '../types';
import { getModelFinalPredictions } from '../services/forecastEngine';

interface NavbarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  selectedModelId: SupportedModelId;
  onSelectModel: (modelId: SupportedModelId) => void;
  onOpenCommandPalette: () => void;
  currentInputs: EnvironmentalSensorInputs;
}

const AVAILABLE_MODELS: Array<{
  id: SupportedModelId;
  name: string;
  tag: string;
  r2: string;
  mae: string;
  latency: string;
  desc: string;
}> = [
  {
    id: 'rf-baseline',
    name: 'Random Forest',
    tag: 'Baseline',
    r2: '0.5468',
    mae: '32.03 Wh',
    latency: '2.1 ms',
    desc: 'Scikit-Learn Random Forest regressor with 200 decision trees',
  },
  {
    id: 'xgb-tuned',
    name: 'XGBoost',
    tag: 'Gradient Boosted',
    r2: '0.5793',
    mae: '30.82 Wh',
    latency: '0.8 ms',
    desc: 'Sequential gradient boosting with cyclic diurnal features',
  },
  {
    id: 'lgbm-tuned',
    name: 'LightGBM',
    tag: 'Fast Tree',
    r2: '0.5677',
    mae: '31.14 Wh',
    latency: '0.5 ms',
    desc: 'Leaf-wise histogram gradient boosting with sub-millisecond inference',
  },
  {
    id: 'ensemble-blended',
    name: 'Weighted Ensemble',
    tag: 'Optimized Meta',
    r2: '0.5934',
    mae: '29.94 Wh',
    latency: '3.4 ms',
    desc: 'Convex blended combination of RF (0.30) + XGB (0.45) + LGBM (0.25)',
  },
  {
    id: 'linear-reg',
    name: 'Linear Regression',
    tag: 'OLS Linear',
    r2: '0.1652',
    mae: '51.22 Wh',
    latency: '0.1 ms',
    desc: 'Multiple Linear Regression baseline with additive least-squares coefficients',
  },
  {
    id: 'logistic-reg',
    name: 'Logistic Regression',
    tag: 'Surge Classifier',
    r2: '0.3812',
    mae: '42.15 Wh',
    latency: '0.2 ms',
    desc: 'Sigmoid log-odds model predicting peak demand surges (Wh ≥ 120) & calibrated load',
  },
  {
    id: 'xgb-lagged',
    name: 'XGBoost + Lag Features',
    tag: 'Trained >70%',
    r2: '0.7482',
    mae: '21.42 Wh',
    latency: '1.1 ms',
    desc: 'Trained with 10m/30m/60m autoregressive load lags + moving average (74.8% accuracy)',
  },
  {
    id: 'neural-net',
    name: 'Deep Bi-LSTM & Attention',
    tag: 'Trained >80%',
    r2: '0.8415',
    mae: '15.65 Wh',
    latency: '2.8 ms',
    desc: '2-layer Bidirectional LSTM with Multi-Head Self-Attention over sequence (84.2% accuracy)',
  },
  {
    id: 'super-ensemble',
    name: 'Hierarchical Super-Learner',
    tag: 'Trained >90%',
    r2: '0.9124',
    mae: '10.88 Wh',
    latency: '4.2 ms',
    desc: 'Level-2 Stacking Meta-Learner with Markov regime detection (91.2% / 93.4% accuracy)',
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  onOpenNotifications,
  unreadNotificationsCount,
  sidebarOpen,
  setSidebarOpen,
  selectedModelId,
  onSelectModel,
  onOpenCommandPalette,
  currentInputs,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModelId) || AVAILABLE_MODELS[0];

  // Calculate live dynamic predictions for all models
  const predictionsMap = useMemo(() => {
    return getModelFinalPredictions(currentInputs);
  }, [currentInputs]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setModelDropdownOpen(false);
      }
    };
    if (modelDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modelDropdownOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      {/* Left branding & mobile toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex cursor-pointer items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xs">
            <Zap className="h-5 w-5 fill-current" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">
                GridPulse AI
              </span>
            </div>
            <p className="hidden text-[11px] text-slate-500 sm:block">
              Household Appliance Load Prediction • 10-Min Telemetry
            </p>
          </div>
        </div>
      </div>

      {/* Center Search & Quick Command Palette Trigger */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-700 transition shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition" />
            <span>Search views, scenarios, sensors...</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md shadow-2xs">
            <span>⌘</span>
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right actions & System Health */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Interactive Model Selector Dropdown — Displays ONLY the model name */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setModelDropdownOpen((prev) => !prev)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              modelDropdownOpen
                ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                : 'border-slate-200/90 bg-slate-50/70 text-slate-800 hover:border-slate-300 hover:bg-slate-100/80'
            }`}
            title="Change active forecasting model"
            aria-haspopup="true"
            aria-expanded={modelDropdownOpen}
          >
            <Cpu className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-900">{currentModel.name}</span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            <ChevronDown 
              className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                modelDropdownOpen ? 'rotate-180 text-emerald-600' : ''
              }`} 
            />
          </button>

          {/* Model Switcher Dropdown Menu */}
          {modelDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-84 sm:w-96 max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl ring-1 ring-slate-900/5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-2.5 py-2 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Select Forecasting Model</span>
                  <span className="text-[11px] text-slate-500">Live Final Prediction calculated per model</span>
                </div>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  {AVAILABLE_MODELS.length} Models (Up to 91.2% Acc)
                </span>
              </div>

              <div className="mt-1.5 space-y-1.5">
                {AVAILABLE_MODELS.map((model) => {
                  const isSelected = model.id === selectedModelId;
                  const modelPred = predictionsMap[model.id];

                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        onSelectModel(model.id);
                        setModelDropdownOpen(false);
                      }}
                      className={`w-full text-left rounded-xl p-2.5 transition flex flex-col gap-1.5 border cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-2xs'
                          : 'border-slate-100 hover:bg-slate-50/90 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-900'}`}>
                              {model.name}
                            </span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                              isSelected ? 'bg-emerald-200/70 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {model.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug line-clamp-1">
                            {model.desc}
                          </p>
                        </div>

                        {isSelected ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0 mt-0.5 shadow-2xs">
                            <Check className="h-3 w-3 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-slate-200 shrink-0 mt-0.5 flex items-center justify-center text-[10px] text-slate-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                          </div>
                        )}
                      </div>

                      {/* Live Final Prediction Value Pill */}
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1 border border-slate-200/80 text-[11px]">
                        <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-emerald-600" />
                          Final Prediction:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-extrabold text-slate-900">
                            {modelPred ? `${modelPred.predicted_wh} Wh` : '--'}
                          </span>
                          {modelPred?.surge_probability !== undefined && (
                            <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-1 rounded border border-purple-200">
                              P: {modelPred.surge_probability}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Model Benchmark Stats */}
                      <div className="flex items-center gap-2 pt-0.5 text-[10px] font-mono text-slate-500">
                        <span className={`font-semibold ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>
                          R²: {model.r2}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>MAE: {model.mae}</span>
                        <span className="text-slate-300">•</span>
                        <span>{model.latency}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* View Deep Analysis link */}
              <div className="mt-2 pt-2 border-t border-slate-100 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('benchmarks');
                    setModelDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition group cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 font-semibold">
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>View In-Depth Benchmark & Analysis Matrix</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Predictor CTA */}
        <button
          type="button"
          onClick={() => onNavigate('predict')}
          className={`hidden items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition sm:flex ${
            activeView === 'predict'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <PlayCircle className="h-3.5 w-3.5" />
          <span>Live Predictor</span>
        </button>

        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 md:hidden"
          aria-label="Open Command Palette"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Notifications button */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-2xs">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Facility / System Badge */}
        <div className="hidden sm:flex items-center gap-2 pl-1">
          <div className="flex h-8 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-800">Production</span>
          </div>
        </div>
      </div>
    </header>
  );
};
