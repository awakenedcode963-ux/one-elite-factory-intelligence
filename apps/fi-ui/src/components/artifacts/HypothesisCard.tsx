import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { cn } from '../../utils/cn.js';
import { motion } from 'motion/react';

export interface HypothesisCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  title: string;
  description: string;
  status: 'ACTIVE' | 'REJECTED' | 'CONFIRMED';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH' | 'CONFIRMED';
  score?: number;
}

export const HypothesisCard = React.forwardRef<HTMLDivElement, HypothesisCardProps>(
  ({ className, title, description, status, confidence, score, ...props }, ref) => {
    
    const getStatusColor = () => {
      if (status === 'CONFIRMED') return 'success';
      if (status === 'REJECTED') return 'danger';
      return 'pending';
    };

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
        ref={ref}
        className={cn("w-full", className)}
        {...props}
      >
        <Card className={cn("overflow-hidden transition-all", {
          "opacity-60 grayscale-[50%] hover:grayscale-0": status === 'REJECTED',
          "border-emerald-200 dark:border-emerald-900/50 shadow-emerald-100/20 dark:shadow-emerald-900/20": status === 'CONFIRMED',
          "border-amber-200 dark:border-amber-900/50": status === 'ACTIVE',
        })}>
          <div className={cn("h-1 w-full", {
             "bg-amber-400 dark:bg-amber-500": status === 'ACTIVE',
             "bg-emerald-500 dark:bg-emerald-600": status === 'CONFIRMED',
             "bg-rose-500 dark:bg-rose-600": status === 'REJECTED',
          })} />
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">{title}</h3>
              {score !== undefined && (
                <div className="flex shrink-0 flex-col items-end">
                  <span className="text-2xl font-bold tracking-tighter text-slate-900 dark:text-slate-100">{score}%</span>
                  <span className="text-[10px] uppercase tracking-wide text-slate-500">Match</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
              {description}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor()}>{status}</Badge>
              <Badge variant="outline" className="text-slate-500 dark:text-slate-400">
                {confidence} CONFIDENCE
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);
HypothesisCard.displayName = "HypothesisCard";
