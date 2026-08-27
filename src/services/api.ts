import { enqueueRecord } from './offlineSyncService';
export const API_URL = 'https://script.google.com/macros/s/AKfycbxgiU5yHEAhHN0sxkxwWR5y5u4unma677T5oPis8CAgK4Iwpxcc5Y-4-cN8pVzlAJM/exec';

import { ProductMaster, DefectMaster, CalibrationMaster, MachineMaster, DimensionMaster, PackagingMaster, EmployeeMaster, MasterData } from '../types/qms';


const fallbackMasterData = {
  products: [
    { Product_Code: "1600200", Product_Family: "Pipes", Process_Type: "Extrusion", Product_Name_EN: "HDPE Pipe 200mm", Product_Name_AR: "ماسورة بولي ايثيلين ٢٠٠ مم", Nominal_Dia_mm: 200, Std_Nominal_Weight_kg: 15.5, "Tolerance_Plus_%": 2, "Tolerance_Minus_%": 2 },
    { Product_Code: "1700200", Product_Family: "Fittings", Process_Type: "Injection", Product_Name_EN: "Elbow 90 deg 200mm", Product_Name_AR: "كوع ٩٠ درجة ٢٠٠ مم", Nominal_Dia_mm: 200, Std_Nominal_Weight_kg: 2.1, "Tolerance_Plus_%": 1.5, "Tolerance_Minus_%": 1.5 },
    { Product_Code: "1601020", Product_Family: "Pipes", Process_Type: "Extrusion", Product_Name_EN: "PPR Pipe PN20 20mm", Product_Name_AR: "ماسورة PPR ضغط 20 قطر 20مم", Nominal_Dia_mm: 20, Std_Nominal_Weight_kg: 0.170, "Tolerance_Plus_%": 2, "Tolerance_Minus_%": 2 },
    { Product_Code: "1601025", Product_Family: "Pipes", Process_Type: "Extrusion", Product_Name_EN: "PPR Pipe PN20 25mm", Product_Name_AR: "ماسورة PPR ضغط 20 قطر 25مم", Nominal_Dia_mm: 25, Std_Nominal_Weight_kg: 0.266, "Tolerance_Plus_%": 2, "Tolerance_Minus_%": 2 },
    { Product_Code: "1601032", Product_Family: "Pipes", Process_Type: "Extrusion", Product_Name_EN: "PPR Pipe PN20 32mm", Product_Name_AR: "ماسورة PPR ضغط 20 قطر 32مم", Nominal_Dia_mm: 32, Std_Nominal_Weight_kg: 0.430, "Tolerance_Plus_%": 2, "Tolerance_Minus_%": 2 },
    { Product_Code: "1601040", Product_Family: "Pipes", Process_Type: "Extrusion", Product_Name_EN: "PPR Pipe PN16 40mm", Product_Name_AR: "ماسورة PPR ضغط 16 قطر 40مم", Nominal_Dia_mm: 40, Std_Nominal_Weight_kg: 0.670, "Tolerance_Plus_%": 2, "Tolerance_Minus_%": 2 },
    { Product_Code: "1601050", Product_Family: "Pipes", Process_Type: "Extrusion", Product_Name_EN: "PPR Pipe PN16 50mm", Product_Name_AR: "ماسورة PPR ضغط 16 قطر 50مم", Nominal_Dia_mm: 50, Std_Nominal_Weight_kg: 1.040, "Tolerance_Plus_%": 2, "Tolerance_Minus_%": 2 },
    { Product_Code: "1602110", Product_Family: "Pipes", Process_Type: "Extrusion", Product_Name_EN: "UPVC Pipe Class 4 110mm", Product_Name_AR: "ماسورة UPVC فئة 4 قطر 110مم", Nominal_Dia_mm: 110, Std_Nominal_Weight_kg: 3.5, "Tolerance_Plus_%": 2, "Tolerance_Minus_%": 2 },
    { Product_Code: "1602160", Product_Family: "Pipes", Process_Type: "Extrusion", Product_Name_EN: "UPVC Pipe Class 4 160mm", Product_Name_AR: "ماسورة UPVC فئة 4 قطر 160مم", Nominal_Dia_mm: 160, Std_Nominal_Weight_kg: 7.2, "Tolerance_Plus_%": 2, "Tolerance_Minus_%": 2 },
    { Product_Code: "1701020", Product_Family: "Fittings", Process_Type: "Injection", Product_Name_EN: "PPR Elbow 90 PN20 20mm", Product_Name_AR: "كوع 90 PPR ضغط 20 قطر 20مم", Nominal_Dia_mm: 20, Std_Nominal_Weight_kg: 0.025, "Tolerance_Plus_%": 1.5, "Tolerance_Minus_%": 1.5 },
    { Product_Code: "1701025", Product_Family: "Fittings", Process_Type: "Injection", Product_Name_EN: "PPR Socket PN20 25mm", Product_Name_AR: "جلبة PPR ضغط 20 قطر 25مم", Nominal_Dia_mm: 25, Std_Nominal_Weight_kg: 0.035, "Tolerance_Plus_%": 1.5, "Tolerance_Minus_%": 1.5 },
    { Product_Code: "1702110", Product_Family: "Fittings", Process_Type: "Injection", Product_Name_EN: "UPVC Tee Class 4 110mm", Product_Name_AR: "مشترك UPVC فئة 4 قطر 110مم", Nominal_Dia_mm: 110, Std_Nominal_Weight_kg: 0.8, "Tolerance_Plus_%": 1.5, "Tolerance_Minus_%": 1.5 },
  ],
  defects: [
    {
      Defect_Code: "1101",
      Defect_Name_EN: "Surface Scratch",
      Defect_Name_AR: "خدش سطحي",
      Process_Type: "Extrusion",
      Severity_Level: "Minor",
      Requires_Immediate_NCR: "NO"
    },
    {
      Defect_Code: "1102",
      Defect_Name_EN: "Wall Thickness out of spec",
      Defect_Name_AR: "سماكة الجدار خارج المواصفات",
      Process_Type: "Extrusion",
      Severity_Level: "Critical",
      Requires_Immediate_NCR: "YES"
    },
    {
      Defect_Code: "1001",
      Defect_Name_EN: "Short Shot",
      Defect_Name_AR: "نقص في الحقن",
      Process_Type: "Injection",
      Severity_Level: "Major",
      Requires_Immediate_NCR: "YES"
    }
  ],
  calibration: [
    {
      Equipment_Tag: "CAL-001",
      Equipment_Name: "Digital Caliper",
      Next_Due_Date: "2026-12-31",
      Status: "Active"
    }
  ],
  machines: [
    {
      Machine_ID: "101",
      Line_Type: "Extrusion",
      Machine_Name: "Extrusion Line 101",
      Status: "Active"
    },
    {
      Machine_ID: "201",
      Line_Type: "Injection",
      Machine_Name: "Injection Machine 201",
      Status: "Active"
    }
  ],
  
  dimensions: [
    {
      Product_Code: "1600200",
      Product_Name_AR: "ماسورة بولي ايثيلين ٢٠٠ مم",
      Nominal_Dia_mm: 200,
      Pressure_Class: "PN16",
      Standard_Ref: "DIN 8074",
      OD_Min_mm: 200.0,
      OD_Max_mm: 201.2,
      Wall_Thickness_Min_mm: 18.2,
      Wall_Thickness_Max_mm: 20.1,
      Max_Ovality_mm: 4.0,
      Status: "Active"
    }
  ],
  packaging: [
    {
      Package_Code: "BOX-A1",
      Package_Name_AR: "كرتونة وصلات حقن كبيرة",
      Length_cm: 60,
      Width_cm: 40,
      Height_cm: 40,
      Volume_cbm: 0.096,
      Empty_Tare_kg: 0.8,
      Max_Gross_kg: 25.0,
      Applicable_Category: "Fittings",
      Status: "Active"
    }
  ]
,
  employees: [
    {
      Employee_Name: "Mohamed Sayed",
      Role: "QC Inspector",
      Department: "Quality",
      Status: "Active",
      Username: "msayed",
      Password_PIN: "2222"
    },
    {
      Employee_Name: "Ayman Mostafa",
      Role: "QA Manager",
      Department: "Quality",
      Status: "Active",
      Username: "amostafa",
      Password_PIN: "1111"
    },
    {
      Employee_Name: "Executive User",
      Role: "Executive",
      Department: "Management",
      Status: "Active",
      Username: "exec",
      Password_PIN: "9999"
    }
  ]
};

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
    console.warn("Failed to fetch master data from API, using fallback data:", error);
    cachedMasterData = fallbackMasterData as unknown as MasterData;
    return cachedMasterData;
  }
};

export const submitInspection = async (targetModule: 'IQC' | 'IPQC_Extrusion' | 'IPQC_Injection' | 'Lab' | 'NCR' | 'Crusher' | 'Complaints', rowDataArray: any) => {
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
        data: rowDataArray
      })
    });
    if (!response.ok) throw new Error("HTTP Status " + response.status);
    const result = await response.json();
    if (result.status !== 'success') {
      throw new Error(result.message || 'Unknown error');
    }
    return result;
  } catch (error) {
    console.error("Failed to submit inspection to API:", error);
    throw new Error('Unable to save the record. No confirmation of persistence was received.');
  }
};

// --- PPC Mock Services ---

let mockWorkOrders: any[] = [
  {
    id: 'WO-1001',
    orderNumber: 'PRD-2023-1001',
    lineMachineId: '101',
    machineType: 'EXTRUSION',
    productCode: '1600200',
    productName: 'HDPE Pipe 200mm',
    targetQuantity: 5000,
    producedQuantity: 1200,
    scrapQuantity: 25,
    unit: 'meters',
    status: 'RUNNING',
    shift: 'Morning',
    plannedStart: new Date().toISOString(),
    plannedEnd: new Date(Date.now() + 86400000).toISOString(),
    standardRatePerHour: 200,
    actualOEE: 85.5
  },
  {
    id: 'WO-1002',
    orderNumber: 'PRD-2023-1002',
    lineMachineId: '201',
    machineType: 'INJECTION',
    productCode: '1700200',
    productName: 'Elbow 90 deg 200mm',
    targetQuantity: 10000,
    producedQuantity: 0,
    scrapQuantity: 0,
    unit: 'pcs',
    status: 'SCHEDULED',
    shift: 'Night',
    plannedStart: new Date(Date.now() + 86400000).toISOString(),
    plannedEnd: new Date(Date.now() + 172800000).toISOString(),
    standardRatePerHour: 500
  }
];

export const fetchWorkOrders = async () => {
  // Mock API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockWorkOrders);
    }, 500);
  });
};

export const createWorkOrder = async (workOrder: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newWo = {
        ...workOrder,
        id: `WO-${Math.floor(Math.random() * 10000)}`,
        producedQuantity: 0,
        scrapQuantity: 0,
        status: 'SCHEDULED'
      };
      mockWorkOrders.push(newWo);
      resolve({ status: 'success', data: newWo });
    }, 500);
  });
};

export const updateWorkOrder = async (id: string, updates: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockWorkOrders = mockWorkOrders.map(wo => wo.id === id ? { ...wo, ...updates } : wo);
      resolve({ status: 'success' });
    }, 500);
  });
};

export const logDowntime = async (log: any) => {
  // In a real app this would post to an endpoint
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: 'success', data: log });
    }, 500);
  });
};
