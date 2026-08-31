import React from 'react';
import { cn } from '../../utils/cn.js';

export const IntelligenceThread = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex h-full flex-col", className)} {...props}>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {children}
      </div>
      <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-950">
        {/* Placeholder for input */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 focus-within:ring-2 focus-within:ring-slate-400">
          <input 
            type="text" 
            placeholder="Describe the issue or ask a question..." 
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
          />
        </div>
      </div>
    </div>
  )
);
IntelligenceThread.displayName = "IntelligenceThread";
