import React from 'react';
import { Clock, CheckCircle2, AlertCircle, RefreshCw, XCircle, FileQuestion } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const configs = {
    'Submitted': {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
      label: 'Submitted'
    },
    'Under Review': {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: RefreshCw,
      label: 'Under Review'
    },
    'In Progress': {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: RefreshCw,
      label: 'In Progress'
    },
    'Awaiting Information': {
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: FileQuestion,
      label: 'Awaiting Info'
    },
    'Resolved': {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      label: 'Resolved'
    },
    'Closed': {
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: XCircle,
      label: 'Closed'
    }
  };

  const current = configs[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
    label: status || 'Unknown'
  };

  const Icon = current.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm font-semibold' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{current.label}</span>
    </span>
  );
}
