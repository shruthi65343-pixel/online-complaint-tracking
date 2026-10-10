import React from 'react';
import { CheckCircle2, Clock, Calendar, User, MessageSquare } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function TimelineView({ history = [], showInternal = false }) {
  if (!history || history.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 text-sm">
        No timeline entries recorded yet.
      </div>
    );
  }

  // Format date helper
  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {history.map((item, index) => {
        const isLatest = index === history.length - 1;

        return (
          <div key={item._id || index} className="relative flex flex-col gap-2">
            {/* Dot Indicator */}
            <div
              className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                isLatest
                  ? 'bg-teal-600 border-white ring-4 ring-teal-100 text-white'
                  : 'bg-white border-slate-400 text-slate-400'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isLatest ? 'bg-white' : 'bg-slate-400'}`} />
            </div>

            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={item.status} size="sm" />
                <span className="font-semibold text-slate-900 text-sm">{item.action || 'Status Updated'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(item.changedAt)}</span>
              </div>
            </div>

            {/* Body / Remarks */}
            {item.remarks && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <div className="flex items-center gap-1.5 text-teal-800 font-semibold mb-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Public Remark:</span>
                </div>
                {item.remarks}
              </div>
            )}

            {/* Admin Internal Note (strictly if showInternal is true) */}
            {showInternal && item.internalNotes && (
              <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <span className="font-bold text-amber-800">[Confidential Admin Note]: </span>
                {item.internalNotes}
              </div>
            )}

            {/* Responsible party */}
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <User className="w-3 h-3 text-slate-400" />
              <span>Updated by: <strong className="text-slate-700 font-medium">{item.changedBy || 'Intake Desk'}</strong></span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
