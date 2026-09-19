import React from 'react';
import { X, Check, Bell, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClear: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">System Notifications</h3>
              <p className="text-[11px] text-slate-500">Forecasting alerts & pipeline status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No notifications at this time.
            </div>
          ) : (
            notifications.map((n) => {
              return (
                <div
                  key={n.id}
                  className={`rounded-xl border p-3 transition ${
                    n.type === 'alert'
                      ? 'border-rose-200 bg-rose-50/50'
                      : n.type === 'warning'
                      ? 'border-amber-200 bg-amber-50/50'
                      : n.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {n.type === 'alert' ? (
                      <AlertTriangle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                    ) : n.type === 'warning' ? (
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    ) : n.type === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    ) : (
                      <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            Mark all read
          </button>
        </div>
      </div>
    </div>
  );
};
