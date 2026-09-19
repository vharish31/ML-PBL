import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  LayoutDashboard, 
  PlayCircle, 
  Sliders, 
  BarChart3, 
  ListOrdered, 
  LineChart, 
  CheckCircle2, 
  ShieldCheck, 
  Terminal, 
  GraduationCap, 
  Code2, 
  Sparkles, 
  ArrowRight, 
  CornerDownLeft,
  X,
  Zap,
  RotateCcw
} from 'lucide-react';
import { SimulationPreset } from '../types';
import { SIMULATION_PRESETS } from '../data/mlData';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (viewId: string) => void;
  onApplyPreset: (preset: SimulationPreset) => void;
  onResetToBaseline: () => void;
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Preset' | 'Action';
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  badge?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onApplyPreset,
  onResetToBaseline,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      // Navigation
      {
        id: 'nav-dashboard',
        category: 'Navigation',
        title: 'Executive Dashboard',
        subtitle: 'High-level telemetry, live inference, and diurnal load curves',
        icon: LayoutDashboard,
        badge: 'Main',
        action: () => {
          onNavigate('dashboard');
          onClose();
        },
      },
      {
        id: 'nav-predict',
        category: 'Navigation',
        title: 'Multi-Zone Live Predictor',
        subtitle: 'Configure micro-climate temperatures, humidity, and lighting',
        icon: PlayCircle,
        badge: 'Interactive',
        action: () => {
          onNavigate('predict');
          onClose();
        },
      },
      {
        id: 'nav-simulation',
        category: 'Navigation',
        title: '24-Hour Diurnal Simulator',
        subtitle: 'Simulate full day load curves across temperature and activity changes',
        icon: Sliders,
        badge: 'Hourly',
        action: () => {
          onNavigate('simulation');
          onClose();
        },
      },
      {
        id: 'nav-benchmarks',
        category: 'Navigation',
        title: 'Model Benchmarks & Metrics',
        subtitle: 'Compare Random Forest, XGBoost, LightGBM, and Stacking Ensemble',
        icon: BarChart3,
        badge: 'R² 0.5468',
        action: () => {
          onNavigate('benchmarks');
          onClose();
        },
      },
      {
        id: 'nav-importance',
        category: 'Navigation',
        title: 'Feature Importance & Causation',
        subtitle: 'Analyze MDI importance, random variable checks, and non-causation rules',
        icon: ListOrdered,
        action: () => {
          onNavigate('importance');
          onClose();
        },
      },
      {
        id: 'nav-eda',
        category: 'Navigation',
        title: 'Exploratory Data Analysis (EDA)',
        subtitle: 'Historical dataset trends, correlation matrices, and standby distributions',
        icon: LineChart,
        action: () => {
          onNavigate('eda');
          onClose();
        },
      },
      {
        id: 'nav-verification',
        category: 'Navigation',
        title: 'Ground Truth Holdout Verification',
        subtitle: 'Evaluate model predictions against actual unseen empirical test cases',
        icon: CheckCircle2,
        action: () => {
          onNavigate('verification');
          onClose();
        },
      },
      {
        id: 'nav-energy_mgmt',
        category: 'Navigation',
        title: 'Energy Management & Peak Shifting',
        subtitle: 'Actionable decision support, tariff savings calculator, and vampire load audit',
        icon: ShieldCheck,
        action: () => {
          onNavigate('energy_mgmt');
          onClose();
        },
      },
      {
        id: 'nav-api',
        category: 'Navigation',
        title: 'Flask REST API Playground',
        subtitle: 'Interactive endpoint tester for /api/predict and /api/metrics',
        icon: Terminal,
        badge: 'REST',
        action: () => {
          onNavigate('api');
          onClose();
        },
      },
      {
        id: 'nav-academic',
        category: 'Navigation',
        title: 'Academic PBL Capstone Report',
        subtitle: 'Complete IEEE/ACM formatted paper, methodology, and 10 viva voce Q&As',
        icon: GraduationCap,
        action: () => {
          onNavigate('academic');
          onClose();
        },
      },
      {
        id: 'nav-python_files',
        category: 'Navigation',
        title: 'Python Source Code Viewer',
        subtitle: 'Inspect train_model.py, predict.py, and app.py scripts',
        icon: Code2,
        action: () => {
          onNavigate('python_files');
          onClose();
        },
      },

      // Actions
      {
        id: 'action-reset',
        category: 'Action',
        title: 'Reset to Baseline Dataset Medians',
        subtitle: 'Restore all 29 sensor parameters to default median state',
        icon: RotateCcw,
        action: () => {
          onResetToBaseline();
          onClose();
        },
      },

      // Presets
      ...SIMULATION_PRESETS.map((preset) => ({
        id: `preset-${preset.id}`,
        category: 'Preset' as const,
        title: `Apply Scenario: ${preset.name}`,
        subtitle: preset.description,
        icon: Sparkles,
        badge: 'Preset',
        action: () => {
          onApplyPreset(preset);
          onClose();
        },
      })),
    ];

    if (!query.trim()) return list;

    const q = query.toLowerCase();
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query, onNavigate, onApplyPreset, onResetToBaseline, onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIndex]) {
          items[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center border-b border-slate-200 px-4 py-3">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, view, scenario preset, or sensor..."
            className="ml-3 w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2">
          {items.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No matching commands or navigation items found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-950 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 truncate">{item.title}</span>
                          {item.badge && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-600">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.subtitle && (
                          <p className="truncate text-[11px] text-slate-500">{item.subtitle}</p>
                        )}
                      </div>
                    </div>

                    <div className="ml-2 shrink-0 flex items-center gap-1.5">
                      {isSelected ? (
                        <span className="flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
                          <span>Select</span>
                          <CornerDownLeft className="h-2.5 w-2.5" />
                        </span>
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono shadow-2xs">↑</kbd>
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono shadow-2xs">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono shadow-2xs">↵</kbd>
              <span>Execute</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono shadow-2xs">ESC</kbd>
              <span>Close</span>
            </span>
          </div>

          <span className="font-medium text-slate-600">Smart Energy AI • Command Palette</span>
        </div>
      </div>
    </div>
  );
};
