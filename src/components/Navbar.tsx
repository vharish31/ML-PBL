import React from 'react';
import { 
  Zap, 
  Bell, 
  BookOpen, 
  Cpu, 
  PlayCircle, 
  Search,
  Menu,
  Terminal,
  Activity,
  ChevronDown,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeModelName: string;
  onOpenCommandPalette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  onOpenNotifications,
  unreadNotificationsCount,
  sidebarOpen,
  setSidebarOpen,
  activeModelName,
  onOpenCommandPalette,
}) => {
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
              <span className="hidden rounded-full bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-700 sm:inline-block">
                PBL ML Platform
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
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-700 transition shadow-2xs group"
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
        {/* Active Model Pill */}
        <button
          type="button"
          onClick={() => onNavigate('benchmarks')}
          className="hidden lg:flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-1.5 text-xs hover:bg-slate-100/80 transition"
          title="Click to view model benchmark comparisons"
        >
          <Cpu className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-slate-500">Model:</span>
          <span className="font-semibold text-slate-800">{activeModelName}</span>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        </button>

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

        {/* REST API Quick Link */}
        <button
          type="button"
          onClick={() => onNavigate('api')}
          className={`hidden rounded-xl border border-slate-200 p-2 transition sm:block ${
            activeView === 'api' 
              ? 'bg-slate-900 text-white border-slate-900' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
          title="Flask REST API Playground & Specs"
        >
          <Terminal className="h-4 w-4" />
        </button>

        {/* Academic Documentation Quick Link */}
        <button
          type="button"
          onClick={() => onNavigate('academic')}
          className={`hidden rounded-xl border border-slate-200 p-2 transition md:block ${
            activeView === 'academic' 
              ? 'bg-emerald-600 text-white border-emerald-600' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
          title="Academic PBL Report & Defense Guide"
        >
          <BookOpen className="h-4 w-4" />
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
        <div className="flex items-center gap-2 pl-1">
          <div className="flex h-8 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-800">Production</span>
          </div>
        </div>
      </div>
    </header>
  );
};
