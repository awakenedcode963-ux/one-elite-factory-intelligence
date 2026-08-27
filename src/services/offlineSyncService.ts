import { API_URL } from './api';

export interface SyncQueueItem {
  id: string;
  module: string;
  data: any;
  timestamp: number;
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  inspectorName: string;
}

const QUEUE_KEY = 'polo_offline_queue';

export const getOfflineQueue = (): SyncQueueItem[] => {
  try {
    const data = localStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const setOfflineQueue = (queue: SyncQueueItem[]) => {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const enqueueRecord = async (module: string, data: any, inspectorName: string): Promise<{status: string, message: string}> => {
  const queue = getOfflineQueue();
  const newItem: SyncQueueItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    module,
    data,
    timestamp: Date.now(),
    status: 'PENDING',
    inspectorName
  };
  queue.push(newItem);
  setOfflineQueue(queue);
  
  window.dispatchEvent(new CustomEvent('polo_sync_update'));
  
  return { status: 'offline_queued', message: 'تم حفظ الفحص محلياً في ذاكرة التابلت - سيتم المزامنة تلقائياً' };
};

export const syncAllRecords = async (): Promise<number> => {
  const queue = getOfflineQueue();
  const pending = queue.filter(item => item.status === 'PENDING' || item.status === 'FAILED');
  
  if (pending.length === 0) return 0;
  if (!navigator.onLine) return 0;

  const updatingQueue = queue.map(item => 
    pending.find(p => p.id === item.id) ? { ...item, status: 'SYNCING' as SyncQueueItem['status'] } : item
  );
  setOfflineQueue(updatingQueue);
  window.dispatchEvent(new CustomEvent('polo_sync_update'));

  let successCount = 0;
  let finalQueue = [...updatingQueue];

  for (const item of pending) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          module: item.module,
          data: item.data
        })
      });
      
      if (!response.ok) throw new Error("HTTP Status " + response.status);
      const result = await response.json();
      if (result.status !== 'success') throw new Error(result.message);
      
      finalQueue = finalQueue.filter(q => q.id !== item.id);
      successCount++;
    } catch (error) {
      console.error(`Failed to sync item ${item.id}`, error);
      finalQueue = finalQueue.map(q => q.id === item.id ? { ...q, status: 'FAILED' as SyncQueueItem['status'] } : q);
    }
  }
  
  setOfflineQueue(finalQueue);
  window.dispatchEvent(new CustomEvent('polo_sync_update'));
  return successCount;
};