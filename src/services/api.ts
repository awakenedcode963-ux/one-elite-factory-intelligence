export const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

import { ProductMaster, DefectMaster, CalibrationMaster, MachineMaster, DimensionMaster, PackagingMaster, EmployeeMaster, MasterData } from '../types/qms';

let cachedMasterData: MasterData | null = null;

export const fetchMasterData = async (): Promise<MasterData> => {
  if (cachedMasterData) return cachedMasterData;
  try {
    const response = await fetch(`${API_URL}?action=getMasterData`);
    if (!response.ok) throw new Error("HTTP Status " + response.status);
    const data = await response.json();
    cachedMasterData = {
      ...data,
      machines: data.machines || [],
      employees: data.employees || [],
      dimensions: data.dimensions || [],
      packaging: data.packaging || []
    };
    return cachedMasterData;
  } catch (error) {
    console.error("Failed to fetch master data from API:", error);
    throw error;
  }
};

export const submitInspection = async (targetModule: string, data: Record<string, any>) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        module: targetModule,
        data: data
      })
    });
    if (!response.ok) throw new Error("HTTP Status " + response.status);
    const result = await response.json();
    if (result.status !== 'success') {
      throw new Error(result.message || 'Unknown error');
    }
    return result;
  } catch (error) {
    console.error(`Failed to submit to ${targetModule}:`, error);
    throw new Error('Unable to save the record. No confirmation of persistence was received.');
  }
};

export const fetchDashboardData = async () => {
  try {
    const response = await fetch(`${API_URL}?action=getDashboardData`);
    if (!response.ok) throw new Error("HTTP Status " + response.status);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    throw error;
  }
};

export const fetchAnalyticsData = async () => {
  try {
    const response = await fetch(`${API_URL}?action=getAnalyticsData`);
    if (!response.ok) throw new Error("HTTP Status " + response.status);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch analytics data:", error);
    throw error;
  }
};

export const fetchWorkOrders = async () => {
  try {
    const response = await fetch(`${API_URL}?action=getWorkOrders`);
    if (!response.ok) throw new Error("HTTP Status " + response.status);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch work orders:", error);
    throw error;
  }
};

export const createWorkOrder = async (workOrder: any) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({
        module: 'WorkOrder_Create',
        data: workOrder
      })
    });
    return await response.json();
  } catch (error) {
    console.error("Failed to create work order:", error);
    throw error;
  }
};

export const updateWorkOrder = async (id: string, updates: any) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({
        module: 'WorkOrder_Update',
        data: { id, ...updates }
      })
    });
    return await response.json();
  } catch (error) {
    console.error("Failed to update work order:", error);
    throw error;
  }
};

export const logDowntime = async (log: any) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({
        module: 'Downtime',
        data: log
      })
    });
    return await response.json();
  } catch (error) {
    console.error("Failed to log downtime:", error);
    throw error;
  }
};
