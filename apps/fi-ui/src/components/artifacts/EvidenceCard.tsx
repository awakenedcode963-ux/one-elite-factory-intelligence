import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card.js';
import { Badge } from '../ui/Badge.js';
import { cn } from '../../utils/cn.js';
import { motion } from 'motion/react';

export interface EvidenceCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  type: string;
  source: string;
  content: string;
  timestamp: string;
  isConfirmed?: boolean;
}

export const EvidenceCard = React.forwardRef<HTMLDivElement, EvidenceCardProps>(
  ({ className, type, source, content, timestamp, isConfirmed = true, ...props }, ref) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      ref={ref}
      className={cn("w-full", className)}
      {...props}
    >
      <Card className={cn("transition-shadow hover:shadow-md", {
        "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900": isConfirmed,
        "border-blue-200 dark:border-blue-900/50 bg-white dark:bg-slate-950": !isConfirmed,
      })}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{source}</span>
            <Badge variant={isConfirmed ? "outline" : "info"} className="text-[10px]">
              {type}
            </Badge>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">{timestamp}</span>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {content}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
);
EvidenceCard.displayName = "EvidenceCard";
