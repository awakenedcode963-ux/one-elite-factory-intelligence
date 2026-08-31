import React from 'react';
import { cn } from '../../utils/cn.js';

export const ArtifactBoard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 items-start auto-rows-max", className)} {...props}>
      {children}
    </div>
  )
);
ArtifactBoard.displayName = "ArtifactBoard";
