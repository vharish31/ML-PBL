/**
 * Utility formatters for energy forecasting metrics
 */

export function formatWh(val: number): string {
  if (val >= 1000) {
    return `${(val / 1000).toFixed(2)} kWh`;
  }
  return `${Math.round(val)} Wh`;
}

export function formatTemp(val: number): string {
  return `${val.toFixed(1)}°C`;
}

export function formatHumidity(val: number): string {
  return `${val.toFixed(1)}%`;
}

export function formatHour(hour: number): string {
  if (hour === 0) return '12:00 AM';
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return '12:00 PM';
  return `${hour - 12}:00 PM`;
}

export function getTierColor(tier: 'Low' | 'Moderate' | 'Elevated' | 'Peak'): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  switch (tier) {
    case 'Peak':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        badge: 'bg-rose-100 text-rose-800 border-rose-300',
      };
    case 'Elevated':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
      };
    case 'Moderate':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-800 border-blue-300',
      };
    case 'Low':
    default:
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      };
  }
}
