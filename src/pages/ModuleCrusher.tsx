import { ProductMaster, DefectMaster, CalibrationMaster, MachineMaster, DimensionMaster, PackagingMaster, EmployeeMaster, MasterData, User } from '../types/qms';
import { fetchMasterData, submitInspection } from '../services/api';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Recycle, AlertTriangle, CheckCircle2, Save, Loader2, Gauge } from 'lucide-react';
 
 
import clsx from 'clsx';
import { format } from 'date-fns';

export function ModuleCrusher() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [masterData, setMasterData] = useState<{ products: ProductMaster[] }>({ products: [] });
  
  const [materialCategory, setMaterialCategory] = useState('PPR Pure White');
  const [weightSent, setWeightSent] = useState('');
  const [machineOrigin, setMachineOrigin] = useState('');
  const operatorName = user?.name || '';
  
  const [targetProduct, setTargetProduct] = useState('');
  const [virginWeight, setVirginWeight] = useState('');
  const [regrindWeight, setRegrindWeight] = useState('');
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchMasterData().then(data => {
      setMasterData({ products: data.products });
    });

    const q = query(collection(db, 'crusher_logs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(data);
    });

    return () => unsubscribe();
  }, []);

  const totalDosing = Number(virginWeight) + Number(regrindWeight);
  const regrindPercent = totalDosing > 0 ? (Number(regrindWeight) / totalDosing) * 100 : 0;
  
  // Logic for warning
  let warning = null;
  if (regrindPercent > 5) {
    warning = "تنبيه جودة: نسبة الكسار تتجاوز الحد المسموح لهذه الفئة";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    try {
      const logId = `CRUSH-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const dateTime = new Date().toISOString();
      const status = 'Logged';
      
      const newRecord = {
        logId,
        materialCategory,
        weightSent: Number(weightSent),
        machineOrigin,
        operatorName,
        targetProduct,
        virginWeight: Number(virginWeight),
        regrindWeight: Number(regrindWeight),
        regrindPercent,
        createdAt: Date.now()
      };
      
      
      
      await submitInspection('Crusher', newRecord);
      
      setShowSuccess(true); setTimeout(() => setShowSuccess(false), 3000);
      
      setWeightSent('');
      setMachineOrigin('');
            setTargetProduct('');
      setVirginWeight('');
      setRegrindWeight('');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Unable to save the record. No confirmation of persistence was received.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
          <Recycle className="w-6 h-6 text-zinc-400" />
          إدارة الكسارة وتدوير الهالك (Crushing & Regrind)
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Scrap Receiving, Crushing Logs, and Dosing Ratio Control.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Inventory Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-5 flex flex-col">
           <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
             <CheckCircle2 className="w-4 h-4 text-emerald-500" />
             Live Crusher Inventory
           </h2>
           <div className="grid grid-cols-2 gap-4 flex-1">
             <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-center">
               <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">PPR Pure White</span>
               <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">1,240 <span className="text-sm font-medium text-zinc-500">kg</span></span>
             </div>
             <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-center">
               <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">PPR Grey/Green</span>
               <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">850 <span className="text-sm font-medium text-zinc-500">kg</span></span>
             </div>
             <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-center">
               <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">UPVC Pipe Scrap</span>
               <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">3,420 <span className="text-sm font-medium text-zinc-500">kg</span></span>
             </div>
             <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-center">
               <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Injection Runners</span>
               <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">510 <span className="text-sm font-medium text-zinc-500">kg</span></span>
             </div>
           </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-2">Scrap Receiving & Crushing Logger</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Material Category</label>
                  <select value={materialCategory} onChange={e => setMaterialCategory(e.target.value)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-amber-500">
                    <option>PPR Pure White</option>
                    <option>PPR Grey/Green</option>
                    <option>UPVC Pipe Scrap</option>
                    <option>Injection Runners/Flash</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Weight Sent (kg)</label>
                  <input required type="number" step="0.1" value={weightSent} onChange={e => setWeightSent(e.target.value)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-amber-500" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Machine Origin (Line/Shift)</label>
                  <input required type="text" value={machineOrigin} onChange={e => setMachineOrigin(e.target.value)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-amber-500" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Operator/Supervisor Name</label>
                  <input type="text" disabled value={operatorName} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm text-zinc-500 cursor-not-allowed" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-2">Dosing & Regrind Ratio Control</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Target Product Formula</label>
                  <select value={targetProduct} onChange={e => setTargetProduct(e.target.value)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-amber-500">
                    <option value="">Select Product...</option>
                    {masterData.products.map(p => (
                      <option key={p.Product_Code} value={p.Product_Code}>{p.Product_Name_EN} ({p.Product_Code})</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Virgin Material (kg)</label>
                  <input required type="number" step="0.1" value={virginWeight} onChange={e => setVirginWeight(e.target.value)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-amber-500" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Regrind Weight (kg)</label>
                  <input required type="number" step="0.1" value={regrindWeight} onChange={e => setRegrindWeight(e.target.value)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-amber-500" />
                </div>
              </div>
              
              <div className="mt-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                  <Gauge className="w-4 h-4 text-zinc-400" />
                  Calculated Regrind %:
                </div>
                <div className={clsx("text-lg font-bold", regrindPercent > 5 ? "text-rose-600 dark:text-rose-400" : "text-zinc-900 dark:text-zinc-100")}>
                  {regrindPercent.toFixed(1)}%
                </div>
              </div>
              
              {warning && (
                <div className="mt-3 p-3 bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-start gap-2 text-sm font-semibold">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{warning}</span>
                </div>
              )}
            </div>

            
            {showSuccess && (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl flex items-start gap-2 text-sm font-semibold ui-transition">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>تم ترحيل سجل الكسارة لقاعدة البيانات بنجاح</span>
              </div>
            )}
            
            <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
               <button
                  type="submit"
                  disabled={isSyncing}
                  className="flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-5 py-2.5 text-sm font-medium text-white dark:text-zinc-900 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 ui-transition"
                >
                  {isSyncing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSyncing ? 'Saving...' : 'Save Record'}
                </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="bg-white dark:bg-zinc-900 flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent Crushing Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-xs border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Origin</th>
                <th className="px-5 py-3 font-medium">Operator</th>
                <th className="px-5 py-3 font-medium">Dosing %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {logs.map(log => (
                <tr key={log.id}>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{format(new Date(log.createdAt), 'HH:mm')}</div>
                    <div className="text-zinc-400 text-xs mt-0.5">{format(new Date(log.createdAt), 'MMM d, yyyy')}</div>
                  </td>
                  <td className="px-5 py-3.5 font-medium">{log.materialCategory}</td>
                  <td className="px-5 py-3.5 text-zinc-500">{log.machineOrigin}</td>
                  <td className="px-5 py-3.5 text-zinc-500">{log.operatorName}</td>
                  <td className="px-5 py-3.5">
                    {log.regrindPercent > 0 ? (
                       <span className={clsx("font-medium", log.regrindPercent > 5 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400")}>
                         {log.regrindPercent.toFixed(1)}% Regrind
                       </span>
                    ) : (
                      <span className="text-zinc-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-zinc-500">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
