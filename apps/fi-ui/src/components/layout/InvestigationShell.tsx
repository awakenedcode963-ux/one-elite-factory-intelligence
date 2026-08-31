import React, { useState } from 'react';
import { cn } from '../../utils/cn.js';
import { PanelRight, X } from 'lucide-react';

export interface InvestigationShellProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  thread?: React.ReactNode;
  board?: React.ReactNode;
  overlay?: React.ReactNode;
}

export const InvestigationShell = React.forwardRef<HTMLDivElement, InvestigationShellProps>(
  ({ className, header, thread, board, overlay, ...props }, ref) => {
    const [isMobileBoardOpen, setIsMobileBoardOpen] = useState(false);

    return (
      <div 
        ref={ref} 
        className={cn("flex h-screen w-full flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 font-sans relative", className)}
        dir="auto" 
        {...props}
      >
        {/* Global Context Header */}
        {header && (
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 dark:border-slate-800 dark:bg-slate-950/80 backdrop-blur-md z-10">
            {header}
            {/* Mobile Board Toggle in Header */}
            <button 
              className="md:hidden p-2 -me-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              onClick={() => setIsMobileBoardOpen(!isMobileBoardOpen)}
              aria-label="Toggle Artifact Board"
            >
              {isMobileBoardOpen ? <X size={20} /> : <PanelRight size={20} />}
            </button>
          </header>
        )}
        
        {/* Main Workspace */}
        <main className="flex flex-1 overflow-hidden relative">
          {/* Intelligence Thread (Left/Center) */}
          <section className="flex w-full md:w-[400px] lg:w-[480px] shrink-0 flex-col border-e border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 relative z-0">
            {thread}
          </section>

          {/* Artifact Board (Desktop) */}
          <section className="hidden md:flex flex-1 flex-col overflow-y-auto bg-slate-100/50 dark:bg-slate-950 p-4 md:p-6 relative z-0">
            {board}
          </section>

          {/* Artifact Board (Mobile Overlay) */}
          {isMobileBoardOpen && (
            <div className="absolute inset-0 z-40 md:hidden flex flex-col bg-slate-100 dark:bg-slate-950 overflow-y-auto">
              <div className="p-4 flex-1">
                {board}
              </div>
            </div>
          )}
        </main>

        {/* Governance / HITL Overlay */}
        {overlay && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
            {overlay}
          </div>
        )}
      </div>
    );
  }
);

InvestigationShell.displayName = "InvestigationShell";
