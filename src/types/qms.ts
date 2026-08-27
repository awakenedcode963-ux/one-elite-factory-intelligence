export interface ProductMaster {
  Product_Code: number | string;
  Product_Family: string;
  Process_Type: string;
  Product_Name_EN: string;
  Product_Name_AR: string;
  Nominal_Dia_mm: number;
  Std_Nominal_Weight_kg: number;
  "Tolerance_Plus_%": number;
  "Tolerance_Minus_%": number;
}

export interface DefectMaster {
  Defect_Code: number | string;
  Defect_Name_EN: string;
  Defect_Name_AR: string;
  Process_Type: string;
  Severity_Level: string;
  Requires_Immediate_NCR: string;
}

export interface CalibrationMaster {
  Equipment_Tag: string;
  Equipment_Name: string;
  Next_Due_Date: string;
  Status: string;
}

export interface MachineMaster {
  Machine_ID: string;
  Line_Type: string;
  Machine_Name: string;
  Status: string;
}

export interface DimensionMaster {
  Product_Code: string;
  Product_Name_AR: string;
  Nominal_Dia_mm: number;
  Pressure_Class: string;
  Standard_Ref: string;
  OD_Min_mm: number;
  OD_Max_mm: number;
  Wall_Thickness_Min_mm: number;
  Wall_Thickness_Max_mm: number;
  Max_Ovality_mm: number;
  Status: string;
}

export interface PackagingMaster {
  Package_Code: string;
  Package_Name_AR: string;
  Length_cm: number;
  Width_cm: number;
  Height_cm: number;
  Volume_cbm: number;
  Empty_Tare_kg: number;
  Max_Gross_kg: number;
  Applicable_Category: string;
  Status: string;
}

export interface EmployeeMaster {
  Employee_Name: string;
  Role: string;
  Department: string;
  Status: string;
  Username?: string;
  Password_PIN?: string;
}

export interface MasterData {
  products: ProductMaster[];
  defects: DefectMaster[];
  calibration: CalibrationMaster[];
  machines: MachineMaster[];
  employees: EmployeeMaster[];
  dimensions?: DimensionMaster[];
  packaging?: PackagingMaster[];
}

export interface User {
  id: string;
  name: string;
  role: string;
  department: string;
  username?: string;
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  lineMachineId: string;
  machineType: 'EXTRUSION' | 'INJECTION';
  productCode: string;
  productName: string;
  targetQuantity: number;
  producedQuantity: number;
  scrapQuantity: number;
  unit: 'meters' | 'pcs' | 'kg';
  status: 'SCHEDULED' | 'RUNNING' | 'ON_HOLD' | 'COMPLETED' | 'QA_RELEASED';
  shift: string;
  plannedStart: string;
  plannedEnd: string;
  standardRatePerHour: number;
  actualOEE?: number;
}

export interface DowntimeLog {
  id: string;
  workOrderId: string;
  machineId: string;
  reasonCategory: 'MAINTENANCE' | 'DIE_CHANGE' | 'PARAMETER_SETTING' | 'RAW_MATERIAL' | 'ELECTRICAL' | 'OTHER';
  durationMinutes: number;
  notes: string;
  timestamp: string;
}

export interface ProductionShiftSummary {
  date: string;
  shift: string;
  totalTarget: number;
  totalActual: number;
  totalScrap: number;
  scrapPercentage: number;
  overallOEE: number;
  activeLinesCount: number;
}
