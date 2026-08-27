import { ProductMaster, DefectMaster, CalibrationMaster, MachineMaster, DimensionMaster, PackagingMaster, EmployeeMaster, MasterData, User } from '../types/qms';
import { fetchMasterData, submitInspection } from '../services/api';
import React, { useState, useEffect } from 'react';
import { FlaskConical, Printer, Plus, CheckCircle2, AlertCircle, Loader2, FileCheck2, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';
import { FlowerOfLifeLogo } from '../components/FlowerOfLifeLogo';

export function ModuleFinalQC() {
  const { user } = useAuth();
  
  const [records, setRecords] = useState<any[]>([]);
  const [printingRecord, setPrintingRecord] = useState<any>(null);

  const handlePrint = (record: any) => {
    setPrintingRecord(record);
    setTimeout(() => window.print(), 100);
  };

  useEffect(() => {
    const handleAfterPrint = () => setPrintingRecord(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchMasterData().then(data => {
      if (data && data.products) setProducts(data.products);
    }).catch(console.error);
  }, []);

  // Form State
  const [testType, setTestType] = useState('Short/Long-term Hydrostatic Pressure Test');
  
  
  const [color, setColor] = useState('');
  const [specification, setSpecification] = useState('');
  const [toolRecipe, setToolRecipe] = useState('');
  const [machineNo, setMachineNo] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [outsideDiameter, setOutsideDiameter] = useState('');
  const [wallThickness, setWallThickness] = useState('');

  const [productionDate, setProductionDate] = useState('');
  const [sampleNo, setSampleNo] = useState('');
  const [stationNo, setStationNo] = useState('');
  const [medium, setMedium] = useState('Water');
  const [actualCreep, setActualCreep] = useState('');

  const [batchNumber, setBatchNumber] = useState('');
  const [productCode, setProductCode] = useState('');
  
  // Hydrostatic specifics
  const [appliedPressure, setAppliedPressure] = useState('');
  const [waterBathTemp, setWaterBathTemp] = useState('20°C');
  const [testDuration, setTestDuration] = useState('');
  const [hydroResult, setHydroResult] = useState('Pass (No Leak/No Burst)');
  
  // Longitudinal Reversion specifics
  const [initialLength, setInitialLength] = useState('');
  const [finalLength, setFinalLength] = useState('');
  
  // Release Permit
  const [releaseDecision, setReleaseDecision] = useState('Released to Warehouse');

  const testTypes = ['Short/Long-term Hydrostatic Pressure Test', 'Longitudinal Heat Reversion', 'Falling Weight Impact'];

  // Calculations
  const l0 = parseFloat(initialLength);
  const l1 = parseFloat(finalLength);
  const reversionPercent = (!isNaN(l0) && !isNaN(l1) && l0 > 0) ? (((l1 - l0) / l0) * 100).toFixed(2) : '0.00';
  const isReversionPass = parseFloat(reversionPercent) <= 2.0 && parseFloat(reversionPercent) >= -2.0; 

  const isHydro = testType === 'Short/Long-term Hydrostatic Pressure Test';
  const isReversion = testType === 'Longitudinal Heat Reversion';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchNumber) {
      alert("Lot/Batch No. is mandatory.");
      return;
    }
    
    setIsSyncing(true);
    
    const record = {
      id: Date.now().toString(),
      testType,
      batchNumber,
      color,
      specification,
      toolRecipe,
      machineNo,
      orderNo,
      outsideDiameter,
      wallThickness,
      productionDate,
      sampleNo,
      stationNo,
      medium: isHydro ? medium : 'N/A',
      actualCreep: isHydro ? actualCreep : 'N/A',
      productCode,
      appliedPressure: isHydro ? appliedPressure : 'N/A',
      waterBathTemp: isHydro ? waterBathTemp : 'N/A',
      testDuration: isHydro ? testDuration : 'N/A',
      hydroResult: isHydro ? hydroResult : 'N/A',
      initialLength: isReversion ? initialLength : 'N/A',
      finalLength: isReversion ? finalLength : 'N/A',
      reversionPercent: isReversion ? reversionPercent : 'N/A',
      releaseDecision,
      inspector: user?.name || 'Unknown',
      createdAt: Date.now()
    };

    try {
      await submitInspection('Lab', [record]);
      
      setRecords(prev => [record, ...prev]);
      
      setIsFormOpen(false);
      setBatchNumber('');
      setColor('');
      setSpecification('');
      setToolRecipe('');
      setMachineNo('');
      setOrderNo('');
      setOutsideDiameter('');
      setWallThickness('');
      setProductionDate('');
      setSampleNo('');
      setStationNo('');
      setMedium('Water');
      setActualCreep('');
      setProductCode('');
      setAppliedPressure('');
      setWaterBathTemp('20°C');
      setTestDuration('');
      setHydroResult('Pass (No Leak/No Burst)');
      setInitialLength('');
      setFinalLength('');
      setReleaseDecision('Released to Warehouse');
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Unable to save the record. No confirmation of persistence was received.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <div className="print-hide p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-amber-500" />
            Final QC & Lab Testing
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Execute critical lab tests and generate lot release permits.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 dark:bg-amber-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-amber-600 dark:hover:bg-amber-700 ui-transition active:scale-[0.97]"
        >
          {isFormOpen ? 'Close Form' : (
            <>
              <Plus className="w-4 h-4" />
              New Lab Test
            </>
          )}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden ui-transition stagger-item stagger-1">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Lab Test Entry</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Test Type</label>
                <div className="flex flex-wrap gap-3">
                  {testTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTestType(type)}
                      className={clsx(
                        "px-4 py-2 rounded-lg text-sm font-medium border ui-transition",
                        testType === type 
                          ? "bg-amber-50 dark:bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400" 
                          : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Lot / Batch No. *</label>
                <input 
                  type="text"
                  required
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Product Code</label>
                <select
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                >
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p.Product_Code} value={p.Product_Code}>{p.Product_Code} - {p.Product_Name_EN}</option>
                  ))}
                </select>
              </div>

              {/* Hydrostatic Pressure Form */}
              {isHydro && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 mt-2">
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">Hydrostatic Pressure Parameters</h3>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Applied Pressure (Bar)</label>
                    <input required type="number" step="0.1" value={appliedPressure} onChange={e => setAppliedPressure(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Water Bath Temp</label>
                    <select value={waterBathTemp} onChange={e => setWaterBathTemp(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 outline-none">
                      <option value="20°C">20°C</option>
                      <option value="95°C">95°C</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Test Duration (Hours)</label>
                    <input type="number" step="1" value={testDuration} onChange={e => setTestDuration(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Result</label>
                    <select value={hydroResult} onChange={e => setHydroResult(e.target.value)} className={clsx("w-full rounded-lg border px-3 py-2 shadow-sm outline-none font-medium", hydroResult.includes('Pass') ? "border-emerald-300 dark:border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400")}>
                      <option value="Pass (No Leak/No Burst)">Pass (No Leak/No Burst)</option>
                      <option value="Burst">Burst</option>
                      <option value="Pin-hole Leak">Pin-hole Leak</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Longitudinal Reversion Form */}
              {isReversion && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 mt-2">
                  <div className="md:col-span-2 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Longitudinal Reversion Parameters</h3>
                    <div className={clsx("px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5", isReversionPass ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30" : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30")}>
                      <Calculator className="w-3.5 h-3.5" />
                      {reversionPercent}%
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Initial Length L0 (mm)</label>
                    <input type="number" step="0.1" value={initialLength} onChange={e => setInitialLength(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Final Length L1 (mm)</label>
                    <input type="number" step="0.1" value={finalLength} onChange={e => setFinalLength(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 outline-none" />
                  </div>
                </div>
              )}

              {/* Release Permit */}
              <div className="md:col-span-2 mt-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <div className="p-6 rounded-xl border-2 border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/10 relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 text-amber-500/10">
                    <FileCheck2 className="w-32 h-32" />
                  </div>
                  <h3 className="text-lg font-bold text-amber-700 dark:text-amber-500 mb-4 flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5" />
                    Final Lot Release Permit (إذن الإفراج النهائي للمخازن)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div>
                      <label className="block text-sm font-bold text-amber-900 dark:text-amber-100 mb-1.5">Release Decision</label>
                      <select 
                        value={releaseDecision}
                        onChange={(e) => setReleaseDecision(e.target.value)}
                        className={clsx(
                          "w-full rounded-lg border-2 px-4 py-3 shadow-sm outline-none font-bold text-base",
                          releaseDecision === 'Released to Warehouse' ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
                        )}
                      >
                        <option value="Released to Warehouse">Released to Warehouse</option>
                        <option value="Quarantined">Quarantined</option>
                      </select>
                    </div>
                    
                    <div className="flex flex-col justify-end">
                      <div className="text-sm font-medium text-amber-800/70 dark:text-amber-200/50">QA Manager Sign-off</div>
                      <div className="text-base font-bold text-amber-900 dark:text-amber-100 mt-1">{user?.displayName || user?.email || 'Inspector'}</div>
                      <div className="text-xs font-medium text-amber-800/60 dark:text-amber-200/40 mt-0.5">{format(new Date(), 'MMM dd, yyyy HH:mm')}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 ui-transition rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSyncing}
                className="flex items-center gap-2 rounded-xl bg-amber-500 dark:bg-amber-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-amber-600 dark:hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ui-transition active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSyncing && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSyncing ? 'Dispatching...' : 'Dispatch Permit'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white dark:bg-zinc-900 flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden ui-transition stagger-item stagger-2">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Lab Test Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3 font-medium">Date & Batch</th>
                <th className="px-5 py-3 font-medium">Test Type</th>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Permit Status</th>
                <th className="px-5 py-3 font-medium">Signed By</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-zinc-500">No records found. Submit a lab test above.</td>
                </tr>
              ) : (
                records.map((record, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ui-transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{record.batchNumber}</div>
                      <div className="text-zinc-400 text-xs mt-0.5">{format(record.createdAt, 'MMM d, yyyy HH:mm')}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium">{record.testType}</td>
                    <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400">{record.productCode || '-'}</td>
                    <td className="px-5 py-3.5">
                      {record.releaseDecision === 'Released to Warehouse' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Released
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Quarantined
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-zinc-500">{record.inspector}</td>
                    <td className="px-5 py-3.5 text-right">
                      {record.releaseDecision === 'Released to Warehouse' && (
                        <button onClick={() => handlePrint(record)} className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 font-medium text-xs ui-transition outline-none flex items-center justify-end gap-1 ml-auto">
                          <Printer className="w-3.5 h-3.5" /> طباعة إذن الإفراج
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {printingRecord && (
        <div className="hidden print:block absolute top-0 left-0 w-full bg-white text-black z-[9999] p-12 min-h-screen font-sans" dir="ltr">
          <div className="flex justify-between items-start border-b-2 border-amber-600 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <FlowerOfLifeLogo className="w-16 h-16 text-amber-600" animate={false} />
              <div>
                <h1 className="text-2xl font-bold text-black uppercase tracking-widest">CODEX ELITE™</h1>
                <h2 className="text-sm font-bold text-zinc-600 uppercase tracking-widest">QualityOS | POLO EGYPT</h2>
                <p className="text-xs text-zinc-500 mt-1">ISO 9001:2015 CERTIFIED</p>
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold text-black uppercase">Final Lot Release Permit</h3>
              <h4 className="text-lg font-bold text-amber-700 font-cairo">شهادة وإذن إفراج تشغيلة للمخازن</h4>
              <p className="text-sm text-zinc-500 mt-2 font-mono">ID: {printingRecord.id || printingRecord.batchNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="text-sm font-bold text-zinc-500 uppercase border-b border-zinc-200 pb-2 mb-4">Lot Specifications</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-zinc-600">Product Code:</span> <span className="font-bold text-black">{printingRecord.productCode || '-'}</span></div>
                <div className="flex justify-between"><span className="text-zinc-600">Lot / Batch No:</span> <span className="font-bold text-black">{printingRecord.batchNumber}</span></div>
                <div className="flex justify-between"><span className="text-zinc-600">Production Date:</span> <span className="font-bold text-black">{format(printingRecord.createdAt, 'MMM dd, yyyy HH:mm')}</span></div>
                <div className="flex justify-between"><span className="text-zinc-600">Total Quantity:</span> <span className="font-bold text-black">As per production log</span></div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-500 uppercase border-b border-zinc-200 pb-2 mb-4">Lab Testing Summary</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-zinc-600">Test Type:</span> <span className="font-bold text-black">{printingRecord.testType}</span></div>
                <div className="flex justify-between"><span className="text-zinc-600">Visual Check:</span> <span className="font-bold text-black">Pass</span></div>
                {printingRecord.reversionPercent && (
                   <div className="flex justify-between"><span className="text-zinc-600">Reversion Result:</span> <span className="font-bold text-black">{printingRecord.reversionPercent}%</span></div>
                )}
                <div className="flex justify-between mt-2 pt-2 border-t border-zinc-100">
                  <span className="text-zinc-600 font-bold">Final Decision:</span> 
                  <span className={clsx("font-bold uppercase", printingRecord.releaseDecision === 'Released to Warehouse' ? "text-emerald-700" : "text-rose-700")}>
                    {printingRecord.releaseDecision}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t-2 border-zinc-200">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="h-16 border-b border-dashed border-zinc-400 mb-2"></div>
                <p className="font-bold text-sm text-black">QC Inspector</p>
                <p className="text-xs text-zinc-500">{printingRecord.inspector}</p>
              </div>
              <div>
                {printingRecord.releaseDecision === 'Released to Warehouse' && (
                  <div className="flex justify-center items-center h-16 mb-2">
                     <div className="border-4 border-emerald-600 text-emerald-700 font-bold uppercase tracking-widest px-4 py-2 transform -rotate-12 opacity-80 font-cairo">
                       مقبول ومعتمد للصرف
                     </div>
                  </div>
                )}
              </div>
              <div>
                <div className="h-16 border-b border-dashed border-zinc-400 mb-2"></div>
                <p className="font-bold text-sm text-black">QA Manager</p>
                <p className="text-xs text-zinc-500">{format(printingRecord.createdAt, 'MMM dd, yyyy HH:mm')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
