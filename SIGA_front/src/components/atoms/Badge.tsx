import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'primary' | 'info';

export type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const badgeVariants: Record<BadgeVariant, string> = {
  success: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  warning: 'bg-amber-100 text-amber-800 border border-amber-200',
  danger: 'bg-red-100 text-red-800 border border-red-200',
  neutral: 'bg-slate-100 text-slate-800 border border-slate-200',
  primary: 'bg-emerald-700 text-white',
  info: 'bg-blue-100 text-blue-800 border border-blue-200',
};

export const Badge = ({ children, variant, className = '' }: BadgeProps) => {
  const variantStyles = variant ? badgeVariants[variant] : '';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantStyles} ${className}`}>
      {children}
    </span>
  );
};
