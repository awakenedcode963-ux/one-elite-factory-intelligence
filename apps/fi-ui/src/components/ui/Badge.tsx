import React from 'react';
import { cn } from '../../utils/cn.js';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'info' | 'pending' | 'success' | 'danger' | 'outline';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400",
          {
            "bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900": variant === 'default',
            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400": variant === 'info',
            "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400": variant === 'pending',
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400": variant === 'success',
            "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400": variant === 'danger',
            "border border-slate-200 text-slate-950 dark:border-slate-800 dark:text-slate-50": variant === 'outline',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
