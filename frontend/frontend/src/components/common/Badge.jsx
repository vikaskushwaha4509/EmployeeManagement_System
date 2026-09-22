import React from 'react';

const STATUS_CONFIG = {
  PRESENT: { label: 'Present', variant: 'emerald' },
  ABSENT: { label: 'Absent', variant: 'rose' },
  HALF_DAY: { label: 'Half Day', variant: 'amber' },
  LEAVE: { label: 'On Leave', variant: 'purple' },
  PENDING: { label: 'Pending', variant: 'amber' },
  APPROVED: { label: 'Approved', variant: 'emerald' },
  REJECTED: { label: 'Rejected', variant: 'rose' },
};

export const Badge = ({
  children,
  status,
  variant = 'slate',
  size = 'md',
  className = '',
  dot = false,
}) => {
  let resolvedLabel = children;
  let resolvedVariant = variant;

  if (status && STATUS_CONFIG[status]) {
    resolvedLabel = STATUS_CONFIG[status].label;
    resolvedVariant = STATUS_CONFIG[status].variant;
  } else if (status) {
    resolvedLabel = status;
  }

  const variants = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    indigo: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const dots = {
    slate: 'bg-slate-400',
    indigo: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
    amber: 'bg-amber-500',
    blue: 'bg-sky-500',
    purple: 'bg-purple-500',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-0.5 text-xs font-medium',
    lg: 'px-3 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variants[resolvedVariant] || variants.slate} ${sizes[size] || sizes.md} ${className}`}
    >
      {(dot || status) && (
        <span className={`w-1.5 h-1.5 rounded-full ${dots[resolvedVariant] || dots.slate}`} />
      )}
      <span>{resolvedLabel}</span>
    </span>
  );
};

export default Badge;

