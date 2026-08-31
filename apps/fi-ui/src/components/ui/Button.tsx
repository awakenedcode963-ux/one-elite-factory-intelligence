import React from 'react';
import { cn } from '../../utils/cn.js';
import { motion, HTMLMotionProps } from 'motion/react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200": variant === 'primary',
            "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700": variant === 'secondary',
            "border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800": variant === 'outline',
            "hover:bg-slate-100 dark:hover:bg-slate-800": variant === 'ghost',
            "bg-rose-500 text-white hover:bg-rose-600": variant === 'danger',
            "h-8 px-3 text-sm": size === 'sm',
            "h-10 px-4 text-base": size === 'md',
            "h-12 px-6 text-lg": size === 'lg',
          },
          className
        )}
        disabled={disabled}
        {...(props as any)}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
