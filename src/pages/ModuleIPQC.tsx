import { ProductMaster, DefectMaster, CalibrationMaster, MachineMaster, DimensionMaster, PackagingMaster, EmployeeMaster, MasterData, User } from '../types/qms';
import { fetchMasterData, submitInspection } from '../services/api';
import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Gauge, Plus, CheckCircle2, AlertTriangle, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ProductQuickSelect } from '../components/ProductQuickSelect';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../lib/LanguageContext';
import { InstrumentRecord } from './ModuleCalibration';
import clsx from 'clsx';
import { SOPReference } from '../components/SOPReference';

interface IPQCRecord {
  id?: string;
  type: 'extrusion' | 'injection' | 'shift_summary';
  reportedInspectorName?: string;
  shiftDate?: string;
  averageWeight?: number;
  machine: string;
  shift?: string;
  jobOrder?: string;
  materialSupplier?: string;
  actualCavity?: number;
  productCode: string;
  // Extrusion specific
  nominalWeight?: number;
  extrusionTemp?: string;
  waterPressure?: string;
  weightPerMeter?: number;
  actualWeight?: number;
  weightDeviation?: number;
  acceptedMeters?: number;
  rejectedMeters?: number;
  // Injection specific
  acceptedPcs?: number;
  rejectedPcs?: number;
  runnerWeight?: number;
  flashWeight?: number;
  // Common
  scrapRate: number;
  measuredOD?: number;
  measuredWallMin?: number;
  measuredWallMax?: number;
  measuredOvality?: number;
  dimensionStatus?: 'pass' | 'fail' | 'none';
  s5LineClearance?: boolean;
  packageCode?: string;
  packageClarity?: boolean;
  packageItemCount?: number;
  inspectorName?: string;
  defectType: string;
instrumentId?: string;
  qaSignedOffBy?: string;
  qaSignedOffAt?: number;
  defectSeverity: 'none' | 'minor' | 'major' | 'critical';
  ncrTriggered: boolean;
  createdAt: number;
}



export function ModuleIPQC() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'extrusion' | 'injection' | 'shift_summary'>('extrusion');
  const [records, setRecords] = useState<IPQCRecord[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [minutesSinceLast, setMinutesSinceLast] = useState<number>(0);
  const [instruments, setInstruments] = useState<InstrumentRecord[]>([]);
  const [masterData, setMasterData] = useState<{ products: ProductMaster[], defects: DefectMaster[], machines: MachineMaster[], employees: EmployeeMaster[], dimensions?: any[], packaging?: any[] }>({ products: [], defects: [], machines: [], employees: [] });


  // Common Form State
  const inspectorName = user?.name || '';
  
  const [shift, setShift] = useState('Shift 1');
  const [jobOrder, setJobOrder] = useState('');
  const [materialSupplier, setMaterialSupplier] = useState('');
  const [actualCavity, setActualCavity] = useState('');
  const [reportedInspectorName, setReportedInspectorName] = useState('');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [averageWeight, setAverageWeight] = useState('');


  const [machine, setMachine] = useState('101');
  const [productCode, setProductCode] = useState('1600200');
  
  const [defectType, setDefectType] = useState('none');
  
  // Dimensional QC State
  const [measuredOD, setMeasuredOD] = useState('');
  const [measuredWallMin, setMeasuredWallMin] = useState('');
  const [measuredWallMax, setMeasuredWallMax] = useState('');
  const [measuredOvality, setMeasuredOvality] = useState('');
  
  // 5S Line Clearance State
  const [s5DieClean, setS5DieClean] = useState(false);
  const [s5TempProfile, setS5TempProfile] = useState(false);
  const [s5Dosing, setS5Dosing] = useState(false);
  const [s5Gauges, setS5Gauges] = useState(false);

  // Packaging State
  const [packageCode, setPackageCode] = useState('');
  const [packageClarity, setPackageClarity] = useState(false);
  const [packageItemCount, setPackageItemCount] = useState('');

  const [instrumentId, setInstrumentId] = useState('');
  
  // Extrusion Form State
  
  const [extrusionTemp, setExtrusionTemp] = useState('');
  const [waterPressure, setWaterPressure] = useState('');
  const [weightPerMeter, setWeightPerMeter] = useState('');

  const [actualWeight, setActualWeight] = useState('');
  const [acceptedMeters, setAcceptedMeters] = useState('');
  const [rejectedMeters, setRejectedMeters] = useState('');

  // Injection Form State
  const [acceptedPcs, setAcceptedPcs] = useState('');
  const [rejectedPcs, setRejectedPcs] = useState('');
  const [runnerWeight, setRunnerWeight] = useState('');
  const [flashWeight, setFlashWeight] = useState('');

  // Derived state for Extrusion
  const currentProduct = masterData.products.find(p => String(p.Product_Code) === productCode);
  const nominalWeight = activeTab === 'extrusion' ? currentProduct?.Std_Nominal_Weight_kg || 0 : 0;
  const weightDevStr = actualWeight ? (((Number(actualWeight) - nominalWeight) / nominalWeight) * 100).toFixed(2) : '0.00';
  const weightDev = Number(weightDevStr);
  const scrapRateExtrusion = (Number(rejectedMeters) > 0) ? (Number(rejectedMeters) / (Number(acceptedMeters) + Number(rejectedMeters))) * 100 : 0;

  // Derived state for Injection
  const scrapRateInjection = (Number(rejectedPcs) > 0) ? (Number(rejectedPcs) / (Number(acceptedPcs) + Number(rejectedPcs))) * 100 : 0;

  // Selected Defect Severity
  const defectsList = masterData.defects.filter(d => d.Process_Type === (activeTab === 'extrusion' ? 'Extrusion' : 'Injection'));
  const selectedDefect = defectsList.find(d => String(d.Defect_Code) === defectType) || { Severity_Level: 'Minor', Requires_Immediate_NCR: 'NO' };
  const isCritical = String(selectedDefect.Severity_Level).toLowerCase() === 'critical';
  const requiresNCR = selectedDefect.Requires_Immediate_NCR === 'YES';

  // NCR Trigger Logic
  const scrapRate = activeTab === 'extrusion' ? scrapRateExtrusion : scrapRateInjection;
  
  // Dimensional QC Eval
  const activeDimensions = masterData.dimensions?.find(d => String(d.Product_Code) === productCode);
  let dimensionStatus = 'none';
  if (activeDimensions && measuredOD && measuredWallMin && measuredWallMax && measuredOvality) {
    const isPass = 
      Number(measuredOD) >= activeDimensions.OD_Min_mm && Number(measuredOD) <= activeDimensions.OD_Max_mm &&
      Number(measuredWallMin) >= activeDimensions.Wall_Thickness_Min_mm && Number(measuredWallMax) <= activeDimensions.Wall_Thickness_Max_mm &&
      Number(measuredOvality) <= activeDimensions.Max_Ovality_mm;
    dimensionStatus = isPass ? 'pass' : 'fail';
  }
  
  const ncrTriggered = requiresNCR || isCritical || scrapRate > 2.0 || (activeTab === 'extrusion' && Math.abs(weightDev) > 5.0) || dimensionStatus === 'fail';


  useEffect(() => {
    fetchMasterData().then(data => {
      setMasterData(data);
      setInstruments(data.calibration.map(c => ({
        id: c.Equipment_Tag,
        name: c.Equipment_Name,
        serialNumber: c.Equipment_Tag,
        dueDate: c.Next_Due_Date.substring(0, 10),
        createdAt: Date.now()
      })));
      if (data.products.length > 0) {
        setProductCode(String(data.products.find(p => p.Process_Type === 'Extrusion')?.Product_Code || ''));
      }
    }).catch(console.error);

    const q = query(collection(db, 'ipqc_inspections'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as IPQCRecord[];
      setRecords(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      if (records.length > 0) {
        // Find most recent record for current tab and machine
        const relevantRecords = records.filter(r => r.type === activeTab && r.machine === machine);
        if (relevantRecords.length > 0) {
          const lastTime = relevantRecords[0].createdAt;
          const diffMs = Date.now() - lastTime;
          setMinutesSinceLast(Math.floor(diffMs / 60000));
        } else {
          setMinutesSinceLast(60); // Default to needing inspection if no records
        }
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [records, activeTab, machine]);

  

  const handleTabChange = (tab: 'extrusion' | 'injection' | 'shift_summary') => {
    setActiveTab(tab);
    setMachine(tab === 'extrusion' ? '101' : '201');
    setProductCode(tab === 'extrusion' ? '1600200' : '1700200');
    setDefectType('none');
      setMeasuredOD('');
      setMeasuredWallMin('');
      setMeasuredWallMax('');
      setMeasuredOvality('');
      setS5DieClean(false);
      setS5TempProfile(false);
      setS5Dosing(false);
      setS5Gauges(false);
      setPackageCode('');
      setPackageClarity(false);
      setPackageItemCount('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    
    try {
      const baseRecord = {
        inspectorName,
        type: activeTab,
        machine,
        productCode,
        defectType: defectType === 'none' ? 'None (Conforming)' : String(selectedDefect.Defect_Code) + ' - ' + selectedDefect.Defect_Name_EN,
        defectSeverity: defectType === 'none' ? 'none' : String(selectedDefect.Severity_Level).toLowerCase(),
instrumentId,
        ncrTriggered,
        measuredOD: measuredOD ? Number(measuredOD) : undefined,
        measuredWallMin: measuredWallMin ? Number(measuredWallMin) : undefined,
        measuredWallMax: measuredWallMax ? Number(measuredWallMax) : undefined,
        measuredOvality: measuredOvality ? Number(measuredOvality) : undefined,
        dimensionStatus,
        s5LineClearance: (s5DieClean && s5TempProfile && s5Dosing && s5Gauges),
        packageCode: packageCode || undefined,
        packageClarity,
        packageItemCount: packageItemCount ? Number(packageItemCount) : undefined,
        createdAt: Date.now()
      };

      
      let newRecord;
      if (activeTab === 'shift_summary') {
        newRecord = {
          ...baseRecord,
          type: 'shift_summary',
          reportedInspectorName,
          shiftDate,
          averageWeight: averageWeight ? Number(averageWeight) : undefined,
          acceptedMeters: Number(acceptedMeters), // reuse state for accepted qty
          rejectedMeters: Number(rejectedMeters), // reuse state for rejected qty
        };
      } else if (activeTab === 'extrusion') {

        newRecord = {
          ...baseRecord,
          nominalWeight,
          extrusionTemp: extrusionTemp || undefined,
          waterPressure: waterPressure || undefined,
          weightPerMeter: weightPerMeter ? Number(weightPerMeter) : undefined,
          actualWeight: Number(actualWeight),
          weightDeviation: weightDev,
          acceptedMeters: Number(acceptedMeters),
          rejectedMeters: Number(rejectedMeters),
          scrapRate: scrapRateExtrusion
        };
      } else {
        newRecord = {
          ...baseRecord,
          acceptedPcs: Number(acceptedPcs),
          rejectedPcs: Number(rejectedPcs),
          runnerWeight: Number(runnerWeight),
          flashWeight: Number(flashWeight),
          scrapRate: scrapRateInjection
        };
      }

      await addDoc(collection(db, 'ipqc_inspections'), newRecord);
      
      // Dispatch to Google Apps Script
      const sheetName = activeTab === 'extrusion' ? 'IPQC_Extrusion' : 'IPQC_Injection';
      await submitInspection(sheetName, newRecord);
      
      // Show success toast
      alert(t('shared.approved') === 'معتمد' 
        ? "✅ تم ترحيل الفحص بنجاح"
        : "✅ Inspection successfully synced");

      setIsFormOpen(false);
      // Reset state
      setActualWeight('');
      setReportedInspectorName('');
      setAverageWeight('');
      setShiftDate(new Date().toISOString().split('T')[0]);
      setExtrusionTemp('');
      setWaterPressure('');
      setWeightPerMeter('');
      setAcceptedMeters('');
      setRejectedMeters('');
      setAcceptedPcs('');
      setRejectedPcs('');
      setRunnerWeight('');
      setFlashWeight('');
      setDefectType('none');
      setMeasuredOD('');
      setMeasuredWallMin('');
      setMeasuredWallMax('');
      setMeasuredOvality('');
      setS5DieClean(false);
      setS5TempProfile(false);
      setS5Dosing(false);
      setS5Gauges(false);
      setPackageCode('');
      setPackageClarity(false);
      setPackageItemCount('');
    } catch (error) {
      console.error("Error adding IPQC document: ", error);
      alert(error instanceof Error ? error.message : "Unable to save the record. No confirmation of persistence was received.");
    } finally {
      setIsSyncing(false);
    }
  };

  const generateNCR = () => {
    alert(`Generated NCR for ${machine} - ${productCode}. Awaiting Manager Approval.`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteDoc(doc(db, 'ipqc_inspections', id));
      } catch (error) {
        console.error("Error deleting record:", error);
      }
    }
  };

  return (
    <div className="w-full">
      <div className="sm:flex sm:items-end sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
            <Gauge className="w-6 h-6 text-zinc-400" />
            {t('ipqc.title')}
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            {t('ipqc.subtitle')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:flex-none">
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-4 py-2.5 text-sm font-medium text-white dark:text-zinc-900 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950 ui-transition active:scale-[0.97]"
          >
            <Plus className="w-4 h-4" />
            {t('iqc.newInspection')}
          </button>
        </div>
      </div>

      {minutesSinceLast >= 60 ? (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          <span className="text-sm font-medium text-rose-800 dark:text-rose-300 flex-1">
            {t('ipqc.routineReminder')} - {t('shared.approved') === 'معتمد' ? 'الفحص مطلوب الآن!' : 'Inspection Required Now!'}
          </span>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300 flex-1">
            {t('ipqc.routineReminder')}
          </span>
          <span className="text-sm font-bold text-amber-700 dark:text-amber-400 bg-amber-200/50 dark:bg-amber-900/50 px-2 py-1 rounded-md">
            {60 - minutesSinceLast} {t('shared.approved') === 'معتمد' ? 'دقيقة متبقية' : 'min left'}
          </span>
        </div>
      )}

      <SOPReference 
        sopCode="SOP-QC-02" 
        title="In-Process Quality Control (Extrusion & Injection)"
        criteria={[
          "Routine checks must be logged every hour during active shifts.",
          "Weight deviation above ±5% triggers an automatic NCR.",
          "Scrap rate exceeding 2.0% requires immediate supervisor notification."
        ]}
      />

      {isFormOpen && (
        <div className="mb-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden ui-transition">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {activeTab === 'extrusion' ? t('ipqc.tabs.extrusion') : activeTab === 'injection' ? t('ipqc.tabs.injection') : language === 'ar' ? 'تقرير الوردية النهائي' : 'Shift End Report'}
            </h3>
            
            {/* Tab Switcher */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => handleTabChange('extrusion')}
                className={clsx(
                  "px-3 py-1 text-xs font-medium rounded-md ui-transition",
                  activeTab === 'extrusion' ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                {t('ipqc.tabs.extrusion')}
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('injection')}
                className={clsx(
                  "px-3 py-1 text-xs font-medium rounded-md ui-transition",
                  activeTab === 'injection' ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                {t('ipqc.tabs.injection')}
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6 text-sm">
              
              <div className="sm:col-span-2">
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{t('shared.approved') === 'معتمد' ? 'مفتش الجودة' : 'QA Inspector'}</label>
                {activeTab === 'shift_summary' ? (
                   <input required type="text" value={reportedInspectorName} onChange={e => setReportedInspectorName(e.target.value)} className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 sm:text-sm text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 outline-none" placeholder={language === 'ar' ? 'اسم المراقب الفعلي' : 'Actual Inspector Name'} />
                ) : (
                   <input type="text" disabled value={inspectorName} className="block w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-4 py-2.5 sm:text-sm text-zinc-500 cursor-not-allowed" />
                )}
              </div>


              <div className="sm:col-span-2">
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{t('ipqc.machine')}</label>
                <select
                  required
                  value={machine}
                  onChange={(e) => setMachine(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                >
                  {masterData.machines
                    .filter(m => activeTab === 'shift_summary' ? true : m.Line_Type === (activeTab === 'extrusion' ? 'Extrusion' : 'Injection'))
                    .map((m, index) => (
                      <option key={`mach-${index}`} value={m.Machine_ID}>{m.Machine_Name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-6">
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-2">{t('ipqc.productCode')}</label>
                <ProductQuickSelect 
                  products={masterData.products} 
                  activeProcess={activeTab} 
                  selectedMachine={machine} 
                  value={productCode} 
                  onChange={setProductCode} 
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{t('ipqc.instrument')}</label>
                <select
                  value={instrumentId}
                  onChange={(e) => setInstrumentId(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                >
                  <option value="" disabled>{t('ipqc.instrumentPlaceholder')}</option>
                  {instruments.map(inst => {
                    const isExpired = new Date(inst.dueDate) < new Date();
                    return (
                      <option key={inst.id} value={inst.id} disabled={isExpired}>
                        {inst.name} ({inst.serialNumber}) {isExpired ? '- EXPIRED' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {activeTab === 'extrusion' && (
                <>
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {t('ipqc.nominalWeight')}
                    </label>
                    <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-mono text-sm flex items-center justify-between">
                      {nominalWeight.toFixed(3)}
                      <span className="text-[10px] uppercase text-zinc-400">Ref</span>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{t('ipqc.actualWeight')}</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={actualWeight}
                      onChange={(e) => setActualWeight(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{language === 'ar' ? 'درجة حرارة البثق' : 'Extrusion Temp (°C)'}</label>
                    <input
                      required
                      type="text"
                      value={extrusionTemp}
                      onChange={(e) => setExtrusionTemp(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{language === 'ar' ? 'ضغط الماء' : 'Water Pressure (Bar)'}</label>
                    <input
                      required
                      type="text"
                      value={waterPressure}
                      onChange={(e) => setWaterPressure(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{language === 'ar' ? 'الوزن لكل متر' : 'Weight per Meter (kg/m)'}</label>
                    <input
                      required
                      type="number"
                      step="0.001"
                      value={weightPerMeter}
                      onChange={(e) => setWeightPerMeter(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                    />
                  </div>


                  <div className="sm:col-span-2">
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{t('ipqc.weightDeviation')}</label>
                    <div className={clsx(
                      "px-3 py-2 rounded-lg border font-mono text-sm flex items-center justify-between",
                      Math.abs(weightDev) <= 3.0 ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400" :
                      Math.abs(weightDev) <= 5.0 ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400" :
                      "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400"
                    )}>
                      {weightDev > 0 ? '+' : ''}{weightDevStr}%
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{t('ipqc.acceptedMeters')}</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={acceptedMeters}
                      onChange={(e) => setAcceptedMeters(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{t('ipqc.rejectedMeters')}</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={rejectedMeters}
                      onChange={(e) => setRejectedMeters(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                    />
                  </div>
                </>
              )}

              {activeTab === 'injection' && (
                <>
                  <div className="sm:col-span-3">
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{t('ipqc.acceptedPcs')}</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={acceptedPcs}
                      onChange={(e) => setAcceptedPcs(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{t('ipqc.rejectedPcs')}</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={rejectedPcs}
                      onChange={(e) => setRejectedPcs(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{t('ipqc.runnerWeight')}</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      value={runnerWeight}
                      onChange={(e) => setRunnerWeight(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{t('ipqc.flashWeight')}</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      value={flashWeight}
                      onChange={(e) => setFlashWeight(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                    />
                  </div>
                </>
              )}

              

              {activeTab !== 'shift_summary' && (
              <>
              {/* Dimensional QC Inspection Card */}
              {activeTab === 'extrusion' && activeDimensions && (
                <div className="sm:col-span-6 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 mt-4">
                  <div className="flex justify-between items-center mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-amber-500" />
                      Dimensional QC Inspection (فحص الأبعاد)
                    </h3>
                    {dimensionStatus !== 'none' && (
                      <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium " + (dimensionStatus === 'pass' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300')}>
                        {dimensionStatus === 'pass' ? 'مطابق للمواصفة القياسية DIN/ISO' : 'خارج حدود التفاوت - Out of Spec'}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">OD (mm) [{activeDimensions.OD_Min_mm} - {activeDimensions.OD_Max_mm}]</label>
                      <input required type="number" step="0.1" value={measuredOD} onChange={e => setMeasuredOD(e.target.value)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-amber-500" placeholder="Measured" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">Wall Min (mm) [&ge;{activeDimensions.Wall_Thickness_Min_mm}]</label>
                      <input required type="number" step="0.1" value={measuredWallMin} onChange={e => setMeasuredWallMin(e.target.value)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-amber-500" placeholder="Min Thickness" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">Wall Max (mm) [&le;{activeDimensions.Wall_Thickness_Max_mm}]</label>
                      <input required type="number" step="0.1" value={measuredWallMax} onChange={e => setMeasuredWallMax(e.target.value)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-amber-500" placeholder="Max Thickness" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">Ovality (mm) [&le;{activeDimensions.Max_Ovality_mm}]</label>
                      <input required type="number" step="0.1" value={measuredOvality} onChange={e => setMeasuredOvality(e.target.value)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-amber-500" placeholder="Max Ovality" />
                    </div>
                  </div>
                </div>
              )}

              {/* 5S Line Clearance Check */}
              <div className="sm:col-span-6 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-3 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  5S Line Clearance & Shift Handover (جاهزية الخط)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={s5DieClean} onChange={e => setS5DieClean(e.target.checked)} className="w-4 h-4 text-amber-600 rounded border-zinc-300 focus:ring-amber-500" />
                    <span className="text-zinc-700 dark:text-zinc-300">Die Head & Vacuum Cleanliness / نظافة رأس الداي وحوض الفاكيوم</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={s5TempProfile} onChange={e => setS5TempProfile(e.target.checked)} className="w-4 h-4 text-amber-600 rounded border-zinc-300 focus:ring-amber-500" />
                    <span className="text-zinc-700 dark:text-zinc-300">Heater Zone Temp Profile / مطابقة درجات الحرارة</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={s5Dosing} onChange={e => setS5Dosing(e.target.checked)} className="w-4 h-4 text-amber-600 rounded border-zinc-300 focus:ring-amber-500" />
                    <span className="text-zinc-700 dark:text-zinc-300">Masterbatch Dosing / نسبة خلط الماسترباتش 1-2%</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={s5Gauges} onChange={e => setS5Gauges(e.target.checked)} className="w-4 h-4 text-amber-600 rounded border-zinc-300 focus:ring-amber-500" />
                    <span className="text-zinc-700 dark:text-zinc-300">Calibrated Gauges Available / توفر أدوات قياس معايرة</span>
                  </label>
                </div>
              </div>

              {/* Packaging Check */}
              <div className="sm:col-span-6 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-3 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                  <Plus className="w-4 h-4 text-blue-500" />
                  Packaging Verification (فحص التعبئة والتغليف)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Package Standard</label>
                    <select value={packageCode} onChange={e => setPackageCode(e.target.value)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-amber-500">
                      <option value="">Select Package...</option>
                      {masterData.packaging?.map(p => (
                        <option key={p.Package_Code} value={p.Package_Code}>{p.Package_Name_AR} ({p.Package_Code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Actual Item Count</label>
                    <input type="number" value={packageItemCount} onChange={e => setPackageItemCount(e.target.value)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-amber-500" placeholder="Items per pack" />
                  </div>
                  <div className="flex items-center mt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={packageClarity} onChange={e => setPackageClarity(e.target.checked)} className="w-4 h-4 text-amber-600 rounded border-zinc-300 focus:ring-amber-500" />
                      <span className="text-zinc-700 dark:text-zinc-300">Labeling & Clarity Approved</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-6">

                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{t('ipqc.defect')}</label>
                <div className="flex flex-wrap gap-2">
                  {[{ Defect_Code: 'none', Defect_Name_EN: 'None (Conforming)', Defect_Name_AR: 'مطابق بدون عيوب', Severity_Level: 'None' }, ...defectsList].map((defect) => {
                    const codeId = String(defect.Defect_Code);
                    const severity = String(defect.Severity_Level).toLowerCase();
                    return (
                    <label key={codeId} className="cursor-pointer">
                      <input
                        type="radio"
                        name="defectType"
                        value={codeId}
                        checked={defectType === codeId}
                        onChange={(e) => setDefectType(e.target.value)}
                        className="sr-only"
                      />
                      <div className={clsx(
                        "px-4 py-2 rounded-lg border text-sm font-medium ui-transition",
                        defectType === codeId
                          ? severity === 'critical' ? "bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                          : severity === 'major' ? "bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                          : (severity === 'minor' || severity === 'process scrap') ? "bg-zinc-100 border-zinc-500 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300"
                          : "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400"
                      )}>
                        {codeId === 'none' ? t('ipqc.noDefect') : `${codeId} - ${t('shared.approved') === 'معتمد' ? defect.Defect_Name_AR : defect.Defect_Name_EN}`}
                      </div>
                    </label>
                  )})}
                </div>
              </div>

              
              </>
              )}
              {ncrTriggered && (
                <div className="sm:col-span-6 mt-2">
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/20 dark:bg-rose-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                      <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                        {t('ipqc.ncrTriggered')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={generateNCR}
                      className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 ui-transition active:scale-[0.97]"
                    >
                      {t('ipqc.generateNCR')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 ui-transition rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                {t('iqc.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSyncing}
                className="flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-5 py-2.5 text-sm font-medium text-white dark:text-zinc-900 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 ui-transition active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSyncing && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSyncing ? t('iqc.saving') : t('ipqc.save')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t('ipqc.logs')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-xs border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3 font-medium">{t('ipqc.time')}</th>
                <th className="px-5 py-3 font-medium">{t('ipqc.line')}</th>
                <th className="px-5 py-3 font-medium">{t('ipqc.metrics')}</th>
                <th className="px-5 py-3 font-medium">{t('ipqc.defect')}</th>
                <th className="px-5 py-3 font-medium text-center">{t('ipqc.status')}</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-zinc-500"><Loader2 className="w-5 h-5 animate-spin mx-auto opacity-50" /></td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-zinc-500">No records found.</td>
                </tr>
              ) : (
                records.map((record) => {
                  const isAccepted = !record.ncrTriggered && record.defectSeverity !== 'critical' && record.defectSeverity !== 'major';
                  
                  return (
                    <tr key={record.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ui-transition group">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">{format(new Date(record.createdAt), 'HH:mm')}</div>
                        <div className="text-zinc-400 text-xs mt-0.5">{format(new Date(record.createdAt), 'MMM d, yyyy')}</div>
                      </td>
                      <td className="px-5 py-3.5 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 ui-transition">
                        <div className="font-medium">{record.machine}</div>
                        <div className="text-zinc-500 text-xs">{record.productCode}</div>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                        {record.type === 'shift_summary' ? (
                          <>
                            Avg: {record.averageWeight}kg<br/>
                            Acc: {record.acceptedMeters} | Rej: {record.rejectedMeters}
                          </>
                        ) : record.type === 'extrusion' ? (
                          <>
                            Dev: <span className={Math.abs(record.weightDeviation || 0) > 5 ? 'text-rose-500' : ''}>{record.weightDeviation}%</span><br/>
                            Scrap: <span className={record.scrapRate > 2 ? 'text-rose-500' : ''}>{record.scrapRate.toFixed(1)}%</span>
                          </>
                        ) : (
                          <>
                            Scrap: <span className={record.scrapRate > 2 ? 'text-rose-500' : ''}>{record.scrapRate.toFixed(1)}%</span><br/>
                            R: {record.runnerWeight}kg | F: {record.flashWeight}kg
                          </>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {record.type === 'shift_summary' ? (
                          <div className="text-xs text-zinc-500">
                            {record.shift}<br/>
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">{record.reportedInspectorName}</span>
                          </div>
                        ) : (
                          <span className={clsx(
                            "inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium border",
                            record.defectSeverity === 'critical' ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" :
                            record.defectSeverity === 'major' ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" :
                            record.defectSeverity === 'minor' ? "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700" :
                            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          )}>
                            {record.defectType}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={clsx(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border",
                          isAccepted ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                        )}>
                          {isAccepted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          {isAccepted ? t('shared.accepted') : t('shared.rejected')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right flex justify-end gap-2">
                        {!record.qaSignedOffBy && (
                          <button
                            onClick={() => {
                              if (window.confirm('Sign off on this inspection?')) {
                                updateDoc(doc(db, 'ipqc_inspections', record.id!), {
                                  qaSignedOffBy: user?.name,
                                  qaSignedOffAt: Date.now()
                                });
                              }
                            }}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded text-[10px] font-semibold ui-transition active:scale-[0.97]"
                          >
                            {t('shared.qaSignOff')}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(record.id!)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 ui-transition"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
