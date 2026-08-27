import React, { useState } from 'react';
import { useSync } from '../lib/SyncContext';
import { Wifi, WifiOff, CloudUpload, Server, RefreshCw } from 'lucide-react';

export function NetworkSyncBadge() {
  const { isOnline, queue, forceSync, isSyncing } = useSync();
  const [isOpen, setIsOpen] = useState(false);

  const pendingCount = queue.filter(q => q.status === 'PENDING' || q.status === 'FAILED').length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ui-transition
          ${isOnline 
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
            : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400'}`}
      >
        {isOnline ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Wifi className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">متصل بالشبكة / Live Sync</span>
          </>
        ) : (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <WifiOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">غير متصل ({pendingCount} فحص معلق) / Offline</span>
          </>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 sm:left-auto top-full mt-2 w-72 sm:w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Offline Queue</h3>
              <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 py-0.5 px-2 rounded-full text-xs font-medium">
                {pendingCount} Pending
              </span>
            </div>
            
            <div className="max-h-64 overflow-y-auto p-2">
              {queue.length === 0 ? (
                <div className="p-4 text-center text-zinc-500 text-sm">
                  <Server className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  No pending records. All synced!
                </div>
              ) : (
                <ul className="space-y-2">
                  {queue.map(item => (
                    <li key={item.id} className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{item.module}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium
                          ${item.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 
                            item.status === 'FAILED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 
                            'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                        <span>{item.inspectorName}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <button 
                onClick={() => { forceSync(); setIsOpen(false); }}
                disabled={isSyncing || pendingCount === 0 || !isOnline}
                className="w-full flex items-center justify-center gap-2 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                مزامنة الكل الآن / Force Sync Now
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
