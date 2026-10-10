import React from 'react';
import { AlertTriangle, AlertOctagon, Info, Flame } from 'lucide-react';

export default function PriorityBadge({ priority, size = 'md' }) {
  const configs = {
    'Low': {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Info,
      label: 'Low Priority'
    },
    'Medium': {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Info,
      label: 'Medium Priority'
    },
    'High': {
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: AlertTriangle,
      label: 'High Priority'
    },
    'Urgent': {
      bg: 'bg-rose-50 text-rose-800 border-rose-300',
      icon: Flame,
      label: 'Urgent'
    }
  };

  const current = configs[priority] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Info,
    label: priority || 'Medium'
  };

  const Icon = current.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1.5 text-sm font-semibold' : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${current.bg} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{current.label}</span>
    </span>
  );
}
