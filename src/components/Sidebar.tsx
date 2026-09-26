import React from 'react';
import {
  LayoutDashboard,
  PlayCircle,
  Sliders,
  BarChart3,
  ListOrdered,
  LineChart,
  CheckCircle2,
  ShieldCheck,
  Database,
  Radio,
  X,
  ExternalLink,
  Flame
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  isOpen,
  onClose,
}) => {
  const navSections = [
    {
      title: 'Forecasting Suite',
      items: [
        { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, badge: 'Live' },
        { id: 'predict', label: 'Live Predictor', icon: PlayCircle, badge: 'Inference' },
        { id: 'simulation', label: '24-Hour Simulation', icon: Sliders, badge: 'Scenario' },
      ],
    },
    {
      title: 'ML Engineering',
      items: [
        { id: 'training', label: 'Model Training Studio', icon: Flame, badge: 'Train >90%' },
        { id: 'benchmarks', label: 'Model Benchmarks', icon: BarChart3, badge: '9 Models' },
        { id: 'importance', label: 'Feature Importance', icon: ListOrdered },
        { id: 'eda', label: 'EDA & Trends', icon: LineChart },
        { id: 'verification', label: 'Ground Truth Verification', icon: CheckCircle2, badge: 'Test Set' },
      ],
    },
    {
      title: 'Decision Support',
      items: [
        { id: 'energy_mgmt', label: 'Energy Management', icon: ShieldCheck },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-68 flex-col border-r border-slate-200/90 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile close header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            <span className="text-sm font-bold text-slate-900">System Navigation</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Facility Info Card */}
        <div className="px-3 pt-4 pb-2">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-800">Smart Residence #01</span>
              </div>
              <span className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[9px] font-mono text-slate-600">
                10-min Hz
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>Location: St. Niklaas</span>
              <span className="font-semibold text-slate-700">Belgium</span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </h3>
              <div className="space-y-0.5 pt-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-900 font-semibold shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition ${
                            isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`rounded px-1.5 py-0.2 text-[10px] font-medium transition ${
                          isActive 
                            ? 'bg-emerald-100/90 text-emerald-800' 
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Telemetry metadata footer card */}
        <div className="border-t border-slate-200/80 p-3 bg-slate-50/40">
          <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Database className="h-3.5 w-3.5 text-emerald-600" />
                <span>UCI Telemetry</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                <Radio className="h-2.5 w-2.5" />
                Streaming
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 leading-tight">
              19,735 rows • 29 features • Chronological holdout test verification.
            </p>
            <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
              <span>Holdout MAE: 32.03 Wh</span>
              <span className="font-semibold text-emerald-600">R²: 0.5468</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
