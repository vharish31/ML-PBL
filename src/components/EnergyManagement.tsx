import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  TrendingDown, 
  Zap, 
  CheckSquare, 
  Info,
  DollarSign,
  HelpCircle
} from 'lucide-react';

export const EnergyManagement: React.FC = () => {
  const [shiftHours, setShiftHours] = useState<number>(3);
  const [laundryLoadsPerWeek, setLaundryLoadsPerWeek] = useState<number>(4);

  // Approximate cost calculations
  // Peak tariff: $0.28/kWh (18:00 - 21:00) vs Off-peak: $0.12/kWh (22:00 - 06:00 or 12:00 - 15:00)
  const peakRate = 0.28;
  const offPeakRate = 0.12;
  const dryerKwhPerCycle = 2.4; // Average electric dryer cycle ~2.4 kWh

  const annualPeakCost = laundryLoadsPerWeek * 52 * dryerKwhPerCycle * peakRate;
  const annualOffPeakCost = laundryLoadsPerWeek * 52 * dryerKwhPerCycle * offPeakRate;
  const annualSavings = Math.round(annualPeakCost - annualOffPeakCost);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Operational Decision Support
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Peak Load Mitigation & Scheduling</span>
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Energy Management & Decision Support
            </h1>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl leading-relaxed">
              Translating predictive machine learning insights into actionable household scheduling recommendations.
              Identify peak demand intervals, optimize appliance timing, and reduce discretionary electricity expenditure.
            </p>
          </div>
        </div>
      </div>

      {/* Critical Academic Scope Rule */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">System Scope Boundary: </span>
            The system <strong>does not directly save energy</strong> or physically cut electrical supply circuits.
            Rather, it provides predictive intelligence that empowers human decision-makers or home automation controllers
            to reschedule flexible appliance operation away from peak surge windows.
          </div>
        </div>
      </div>

      {/* 4 Decision Strategies */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Strategy 1: Diurnal Load Shifting */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              1. Diurnal Peak Load Shifting
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The dataset and model confirm a daily peak demand window between <strong>18:00 and 21:00</strong> (averaging 210–240 Wh).
            Running major thermal appliances (tumble dryers, dishwashers) during this interval concentrates grid demand and incurs top-tier time-of-use tariffs.
          </p>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
            <span className="font-semibold text-slate-900 block">Recommended Scheduling Action:</span>
            <span>Shift washing machine and tumble dryer cycles to <strong>13:00 midday</strong> (solar peak) or <strong>after 22:30</strong> (off-peak night).</span>
          </div>
        </div>

        {/* Strategy 2: Standby & Vampire Load */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              2. Standby / Vampire Load Audit
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The model demonstrates a continuous baseline floor of ~<strong>45 Wh</strong> even at 03:00 deep night when all occupants are asleep and lights are 0 Wh.
            This represents ~1.08 kWh/day of continuous baseline load (refrigerator compressor, Wi-Fi router, TV standby, chargers).
          </p>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
            <span className="font-semibold text-slate-900 block">Recommended Audit Action:</span>
            <span>Utilize smart power strips for entertainment hubs and verify refrigerator door seal integrity to minimize cyclic compressor runtime.</span>
          </div>
        </div>

        {/* Strategy 3: Co-Occurrence Avoidance */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Calendar className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              3. Avoid Concurrent Appliance Bursts
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dataset spikes exceeding 400+ Wh consistently correspond to simultaneous operations (e.g. electric oven + clothes dryer running in the same 10-minute interval).
            Staggering high-draw cycles by just 45 minutes smooths aggregate household load demand.
          </p>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
            <span className="font-semibold text-slate-900 block">Recommended Scheduling Action:</span>
            <span>Sequence high-wattage chores sequentially rather than in parallel during evening food preparation hours.</span>
          </div>
        </div>

        {/* Strategy 4: Environmental Micro-Climate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <TrendingDown className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              4. Thermal Micro-Climate Synergies
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            High laundry humidity (RH_3 &gt; 50%) and elevated kitchen humidity (RH_1) signal moisture accumulation from drying clothes and boiling water.
            Proper localized ventilation reduces auxiliary dehumidification and space conditioning work.
          </p>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
            <span className="font-semibold text-slate-900 block">Recommended Operational Action:</span>
            <span>Engage kitchen range hoods during cooking and exhaust fans during laundry to prevent indoor thermal / moisture trapping.</span>
          </div>
        </div>
      </div>

      {/* Interactive Load Shifting Cost Calculator */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Time-of-Use (TOU) Load Shifting Calculator
            </h3>
            <p className="text-xs text-slate-500">
              Estimate potential financial savings from shifting heavy laundry dryer cycles from peak (19:00) to off-peak hours
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-700 font-semibold">
            TOU Tariff Model
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Laundry Cycles per Week: <span className="font-bold text-slate-900">{laundryLoadsPerWeek}</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={laundryLoadsPerWeek}
              onChange={(e) => setLaundryLoadsPerWeek(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1">
            <span className="text-[11px] text-slate-500 block">Peak Running Cost (@$0.28/kWh):</span>
            <div className="font-mono text-lg font-bold text-slate-800">
              ${annualPeakCost.toFixed(2)} / year
            </div>
            <span className="text-[10px] text-slate-400">If operated between 18:00–21:00</span>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-1">
            <span className="text-[11px] text-emerald-800 block">Off-Peak Running Cost (@$0.12/kWh):</span>
            <div className="font-mono text-lg font-bold text-emerald-900">
              ${annualOffPeakCost.toFixed(2)} / year
            </div>
            <span className="text-[11px] font-semibold text-emerald-700">
              Potential Savings: ~${annualSavings}/year
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
