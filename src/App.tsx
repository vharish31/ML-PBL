import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { NotificationModal } from './components/NotificationModal';
import { DashboardOverview } from './components/DashboardOverview';
import { LivePredictor } from './components/LivePredictor';
import { SimulationPlayground } from './components/SimulationPlayground';
import { ModelBenchmarks } from './components/ModelBenchmarks';
import { FeatureImportance } from './components/FeatureImportance';
import { EdaView } from './components/EdaView';
import { GroundTruthVerification } from './components/GroundTruthVerification';
import { EnergyManagement } from './components/EnergyManagement';
import { CommandPalette } from './components/CommandPalette';

import { 
  DEFAULT_SENSOR_INPUTS, 
  SYSTEM_NOTIFICATIONS, 
  SIMULATION_PRESETS 
} from './data/mlData';
import { 
  EnvironmentalSensorInputs, 
  NotificationItem, 
  VerificationSample, 
  SimulationPreset 
} from './types';
import { runModelInference } from './services/forecastEngine';
import { 
  CheckCircle2, 
  X, 
  Radio, 
  Sparkles, 
  Cpu, 
  Database, 
  Activity, 
  ShieldCheck, 
  FileText, 
  ExternalLink,
  Zap
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [inputs, setInputs] = useState<EnvironmentalSensorInputs>(DEFAULT_SENSOR_INPUTS);
  const [selectedModelId, setSelectedModelId] = useState<'rf-baseline' | 'xgb-tuned' | 'lgbm-tuned' | 'ensemble-blended'>('rf-baseline');
  const [notifications, setNotifications] = useState<NotificationItem[]>(SYSTEM_NOTIFICATIONS);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Global hotkey for Command Palette (⌘K / Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Trigger toast with auto-clear
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  // Compute live prediction
  const currentPrediction = useMemo(() => {
    return runModelInference(inputs, selectedModelId);
  }, [inputs, selectedModelId]);

  // Actions
  const handleResetToBaseline = useCallback(() => {
    setInputs(DEFAULT_SENSOR_INPUTS);
    showToast('Reset all environmental parameters to dataset median values.');
  }, [showToast]);

  const handleApplyPreset = useCallback((preset: SimulationPreset) => {
    setInputs((prev) => ({
      ...prev,
      ...preset.inputs,
    }));
    showToast(`Applied preset: ${preset.name}`);
  }, [showToast]);

  const handleLoadVerificationSample = useCallback((sample: VerificationSample) => {
    setInputs((prev) => ({
      ...prev,
      T_out: sample.t_out,
      RH_out: sample.rh_out,
      lights: sample.lights,
      hour: sample.hour,
    }));
    showToast(`Loaded holdout test case #${sample.id} (${sample.actual_wh} Wh ground truth).`);
  }, [showToast]);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    showToast('All notifications cleared.');
  };

  const handleSelectModel = (modelId: 'rf-baseline' | 'xgb-tuned' | 'lgbm-tuned' | 'ensemble-blended') => {
    setSelectedModelId(modelId);
    const names: Record<string, string> = {
      'rf-baseline': 'Random Forest (Baseline)',
      'xgb-tuned': 'XGBoost',
      'lgbm-tuned': 'LightGBM',
      'ensemble-blended': 'Weighted Ensemble',
    };
    showToast(`Switched active model to ${names[modelId] || modelId}. Forecasting analysis updated.`);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 antialiased flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Enterprise Fixed Header */}
      <Navbar
        activeView={activeView}
        onNavigate={(v: string) => {
          setActiveView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
        sidebarOpen={mobileSidebarOpen}
        setSidebarOpen={setMobileSidebarOpen}
        selectedModelId={selectedModelId}
        onSelectModel={handleSelectModel}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Real-Time Telemetry & Status Strip */}
      <div className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xs px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Telemetry Live
            </span>
            <span className="hidden sm:inline-block text-slate-300">|</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
              <Activity className="h-3 w-3 text-slate-400" />
              Inference Latency: 12ms
            </span>
            <span className="hidden md:inline-block text-slate-300">|</span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-slate-600 text-[11px]">
              <Database className="h-3 w-3 text-slate-400" />
              UCI 19,735 Samples • 80/20 Chronological Split
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition"
            >
              <span>Quick Actions</span>
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1 text-[9px] font-mono shadow-2xs">⌘K</kbd>
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={handleResetToBaseline}
              className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 transition"
            >
              Reset Baseline
            </button>
          </div>
        </div>
      </div>

      {/* Main Body Container: Sidebar + Page View Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          activeView={activeView}
          onNavigate={(v: string) => {
            setActiveView(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        {/* View Router */}
        <main className="flex-1 min-w-0 pb-12" id="main-content">
          {activeView === 'dashboard' && (
            <DashboardOverview
              currentInputs={inputs}
              prediction={currentPrediction}
              onApplyPreset={handleApplyPreset}
              onNavigate={setActiveView}
              selectedModelId={selectedModelId}
            />
          )}

          {activeView === 'predict' && (
            <LivePredictor
              inputs={inputs}
              onInputChange={setInputs}
              prediction={currentPrediction}
              selectedModelId={selectedModelId}
              onModelChange={handleSelectModel}
              onResetToBaseline={handleResetToBaseline}
            />
          )}

          {activeView === 'simulation' && (
            <SimulationPlayground
              currentInputs={inputs}
              onInputChange={setInputs}
              selectedModelId={selectedModelId}
            />
          )}

          {activeView === 'benchmarks' && (
            <ModelBenchmarks
              selectedModelId={selectedModelId}
              onSelectModel={handleSelectModel}
            />
          )}

          {activeView === 'importance' && (
            <FeatureImportance />
          )}

          {activeView === 'eda' && (
            <EdaView />
          )}

          {activeView === 'verification' && (
            <GroundTruthVerification
              onLoadSample={handleLoadVerificationSample}
              onNavigate={setActiveView}
            />
          )}

          {activeView === 'energy_mgmt' && (
            <EnergyManagement />
          )}
        </main>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900 shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-emerald-600 hover:text-emerald-900 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(v) => {
          setActiveView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onApplyPreset={handleApplyPreset}
        onResetToBaseline={handleResetToBaseline}
      />

      {/* Notifications Drawer / Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClear={handleClearAllNotifications}
      />

      {/* Professional Multi-Column Footer */}
      <footer className="border-t border-slate-200 bg-white pt-10 pb-8 text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
                  <Zap className="h-4 w-4 fill-current" />
                </div>
                <span className="text-base font-bold tracking-tight text-slate-900">
                  GridPulse AI
                </span>
                <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                  v2.4.0 Production
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                Enterprise machine learning platform for household micro-climatic energy load prediction.
                Engineered with Scikit-Learn Random Forest, XGBoost, and LightGBM on 10-minute sensor telemetry.
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  API Status: Online
                </span>
                <span>•</span>
                <span>Port: 3000 (Vite + Node)</span>
                <span>•</span>
                <span>SSL: Active</span>
              </div>
            </div>

            {/* Navigation links */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Forecasting Engine
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li>
                  <button onClick={() => { setActiveView('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-700 transition">
                    Executive Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveView('predict'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-700 transition">
                    Multi-Zone Live Predictor
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveView('simulation'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-700 transition">
                    24-Hour Diurnal Simulator
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveView('benchmarks'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-700 transition">
                    Model Benchmark Matrix
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveView('verification'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-700 transition">
                    Holdout Test Verification
                  </button>
                </li>
              </ul>
            </div>

            {/* Technical Resources */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Engineering & Research
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li>
                  <button onClick={() => { setActiveView('energy_mgmt'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-700 transition">
                    Energy Decision Support
                  </button>
                </li>
                <li>
                  <button onClick={() => { setActiveView('importance'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-700 transition">
                    Feature MDI & Causation
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom copyright & attribution */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              © 2026 GridPulse AI • Smart Energy Consumption Forecasting Platform.
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>UCI Machine Learning Repository: Appliances Energy</span>
              <span>•</span>
              <span>Luis M. Candanedo et al. (Energy and Buildings, 2017)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
