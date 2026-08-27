import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getOfflineQueue, syncAllRecords, SyncQueueItem } from '../services/offlineSyncService';

interface SyncContextType {
  isOnline: boolean;
  queue: SyncQueueItem[];
  forceSync: () => Promise<void>;
  isSyncing: boolean;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const updateQueueState = () => {
    setQueue(getOfflineQueue());
  };

  useEffect(() => {
    updateQueueState();

    const handleOnline = async () => {
      setIsOnline(true);
      await performSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('polo_sync_update', updateQueueState);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('polo_sync_update', updateQueueState);
    };
  }, []);

  const performSync = async () => {
    if (isSyncing || !navigator.onLine) return;
    
    setIsSyncing(true);
    try {
      const count = await syncAllRecords();
      if (count > 0) {
        // Find a way to show a toast, maybe just dispatch an event or use a simple alert if toast isn't available
        // The prompt asks for an Emerald toast. We can dispatch a global event that layout listens to, or just create it here.
        window.dispatchEvent(new CustomEvent('polo_toast', { 
          detail: { type: 'success', message: `تمت مزامنة (${count}) سجلات بنجاح مع السحابة 🚀` } 
        }));
      }
    } finally {
      setIsSyncing(false);
      updateQueueState();
    }
  };

  return (
    <SyncContext.Provider value={{ isOnline, queue, forceSync: performSync, isSyncing }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
