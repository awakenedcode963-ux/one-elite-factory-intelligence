import React from 'react';
import { cn } from '../../utils/cn.js';
import { motion } from 'motion/react';
import { Card, CardHeader, CardContent } from '../ui/Card.js';

export const GovernanceOverlay = React.forwardRef<HTMLDivElement, Omit<React.HTMLAttributes<HTMLDivElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart">>(
  ({ className, children, ...props }, ref) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      ref={ref}
      className={cn("w-full max-w-lg p-4", className)}
      {...props}
    >
      <Card className="shadow-xl dark:shadow-2xl border-amber-200 dark:border-amber-900/50 overflow-hidden">
        <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-3 border-b border-amber-100 dark:border-amber-900/50">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Authorization Required
          </span>
        </div>
        {children}
      </Card>
    </motion.div>
  )
);
GovernanceOverlay.displayName = "GovernanceOverlay";
