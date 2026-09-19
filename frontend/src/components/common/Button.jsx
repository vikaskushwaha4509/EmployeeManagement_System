import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false,
  disabled = false,
  onClick,
  className = '',
  icon: Icon,
  ...props
}) => {
  const isButtonLoading = isLoading || loading;
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm sm:text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isButtonLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isButtonLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children && <span>{children}</span>}
    </button>
  );
};

export default Button;
