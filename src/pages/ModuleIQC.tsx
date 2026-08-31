import { ProductMaster, DefectMaster, CalibrationMaster, MachineMaster, DimensionMaster, PackagingMaster, EmployeeMaster, MasterData, User } from '../types/qms';
import { fetchMasterData, submitInspection } from '../services/api';
import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Plus, CheckCircle2, AlertCircle, Loader2, Factory } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../lib/LanguageContext';
import clsx from 'clsx';

export function ModuleIQC() {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [records, setRecords] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form State
  const [category, setCategory] = useState('PPR Granules');
  
  const [supplierCode, setSupplierCode] = useState('');
  const [requestingDept, setRequestingDept] = useState('');
  const [requestingDeptCode, setRequestingDeptCode] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [unit, setUnit] = useState('Kg');
  const [acceptedQty, setAcceptedQty] = useState('');
  const [rejectedQty, setRejectedQty] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const [supplier, setSupplier] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [coaVerified, setCoaVerified] = useState(true);
  const [mfiValue, setMfiValue] = useState('');
  const [brassThreadCheck, setBrassThreadCheck] = useState('Pass');
  const [moistureCheck, setMoistureCheck] = useState('Conforming');
  const [decision, setDecision] = useState('Accepted');
  const [notes, setNotes] = useState('');

  const categories = ['PPR Granules', 'PVC Resin', 'Masterbatch', 'Brass Inserts', 'Packaging'];

  // Validation logic
  const isPolymer = category === 'PPR Granules' || category === 'PVC Resin' || category === 'Masterbatch';
  const isBrass = category === 'Brass Inserts';

  const mfiNum = parseFloat(mfiValue);
  const isMfiOutOfSpec = isPolymer && !isNaN(mfiNum) && (mfiNum < 0.2 || mfiNum > 0.4);

  useEffect(() => {
    // Auto-block logic
    let shouldReject = false;
    if (!coaVerified) shouldReject = true;
    if (isMfiOutOfSpec) shouldReject = true;
    if (isBrass && brassThreadCheck === 'Fail') shouldReject = true;
    if (moistureCheck === 'Out of Spec') shouldReject = true;

    if (shouldReject && decision === 'Accepted') {
      setDecision('Quarantined'); // Auto downgrade
    }
  }, [coaVerified, isMfiOutOfSpec, brassThreadCheck, moistureCheck, isBrass, decision]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchNumber) {
      alert("Batch Number is mandatory.");
      return;
    }
    
    setIsSyncing(true);
    
    const record = {
      id: Date.now().toString(),
      category,
      supplier,
      supplierCode,
      requestingDept,
      requestingDeptCode,
      poNumber,
      itemCode,
      unit,
      acceptedQty: parseFloat(acceptedQty) || 0,
      rejectedQty: parseFloat(rejectedQty) || 0,
      rejectionReason: (decision === 'Rejected' || decision === 'Quarantined') ? rejectionReason : 'N/A',
      batchNumber,
      quantity,
      coaVerified: coaVerified ? 'Attached & Conforming' : 'Missing',
      mfiValue: isPolymer ? mfiValue : 'N/A',
      brassThreadCheck: isBrass ? brassThreadCheck : 'N/A',
      moistureCheck,
      decision,
      notes,
      inspector: user?.name || 'Unknown',
      createdAt: Date.now()
    };

    try {
      await submitInspection('IQC', record);
      
      setRecords(prev => [record, ...prev]);
      
      setIsFormOpen(false);
      setSupplier('');
      setSupplierCode('');
      setRequestingDept('');
      setRequestingDeptCode('');
      setPoNumber('');
      setItemCode('');
      setUnit('Kg');
      setAcceptedQty('');
      setRejectedQty('');
      setRejectionReason('');
      setBatchNumber('');
      setQuantity('');
      setCoaVerified(true);
      setMfiValue('');
      setBrassThreadCheck('Pass');
      setMoistureCheck('Conforming');
      setDecision('Accepted');
      setNotes('');
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Unable to save the record. No confirmation of persistence was received.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-amber-500" />
            Incoming QC (Raw Materials)
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Inspect and verify incoming materials against specifications.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 dark:bg-amber-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-amber-600 dark:hover:bg-amber-700 ui-transition active:scale-[0.97]"
        >
          {isFormOpen ? 'Close Form' : (
            <>
              <Plus className="w-4 h-4" />
              New Inspection
            </>
          )}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden ui-transition stagger-item stagger-1">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Inspection Details</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Material Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Supplier Name</label>
                <input 
                  type="text"
                  required
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="E.g., SABIC"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Vendor Lot / Batch No. *</label>
                <input 
                  type="text"
                  required
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Received Quantity (kg/Pcs)</label>
                <input 
                  type="number"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="md:col-span-2 border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Inspection Criteria</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* COA Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">COA Verification</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">Is Certificate of Analysis attached & conforming?</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={coaVerified} onChange={e => setCoaVerified(e.target.checked)} />
                      <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {/* Moisture Check */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Moisture & Visual Homogeneity</label>
                    <select 
                      value={moistureCheck}
                      onChange={(e) => setMoistureCheck(e.target.value)}
                      className={clsx(
                        "w-full rounded-lg border px-3 py-2 shadow-sm outline-none",
                        moistureCheck === 'Conforming' ? "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" : "border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400"
                      )}
                    >
                      <option value="Conforming">Conforming</option>
                      <option value="Out of Spec">Out of Spec</option>
                    </select>
                  </div>

                  {/* Dynamic Fields */}
                  {isPolymer && (
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">MFI Test Value (g/10min)</label>
                      <div className="relative">
                        <input 
                          type="number"
                          step="0.01"
                          value={mfiValue}
                          onChange={(e) => setMfiValue(e.target.value)}
                          className={clsx(
                            "w-full rounded-lg border px-3 py-2 shadow-sm outline-none",
                            isMfiOutOfSpec 
                              ? "border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-500/10 text-rose-900 dark:text-rose-100 focus:ring-rose-500 focus:border-rose-500" 
                              : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-amber-500 focus:border-amber-500"
                          )}
                          placeholder="e.g. 0.3"
                        />
                        {isMfiOutOfSpec && (
                          <div className="absolute right-3 top-2.5 text-rose-500 flex items-center gap-1 text-xs font-medium">
                            <AlertCircle className="w-4 h-4" /> Out of Spec (0.2-0.4)
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {isBrass && (
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Brass Thread Go/No-Go</label>
                      <select 
                        value={brassThreadCheck}
                        onChange={(e) => setBrassThreadCheck(e.target.value)}
                        className={clsx(
                          "w-full rounded-lg border px-3 py-2 shadow-sm outline-none",
                          brassThreadCheck === 'Pass' ? "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" : "border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400"
                        )}
                      >
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Final Decision</label>
                    <select 
                      value={decision}
                      onChange={(e) => setDecision(e.target.value)}
                      className={clsx(
                        "w-full rounded-lg border px-3 py-2 shadow-sm outline-none font-medium",
                        decision === 'Accepted' ? "border-emerald-300 dark:border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" :
                        decision === 'Rejected' ? "border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400" :
                        "border-amber-300 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      )}
                    >
                      {(!coaVerified || isMfiOutOfSpec || (isBrass && brassThreadCheck === 'Fail') || moistureCheck === 'Out of Spec') ? null : (
                        <option value="Accepted">Accepted</option>
                      )}
                      <option value="Rejected">Rejected</option>
                      <option value="Quarantined">Quarantined</option>
                    </select>
                    {(!coaVerified || isMfiOutOfSpec) && decision !== 'Accepted' && (
                      <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> 'Accepted' is blocked due to failed criteria.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Notes</label>
                    <textarea 
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
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
                className="flex items-center gap-2 rounded-xl bg-amber-500 dark:bg-amber-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-amber-600 dark:hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ui-transition active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSyncing && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSyncing ? 'Saving...' : 'Submit Inspection'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white dark:bg-zinc-900 flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden ui-transition stagger-item stagger-2">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent Inspections</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3 font-medium">Date & Batch</th>
                <th className="px-5 py-3 font-medium">Material</th>
                <th className="px-5 py-3 font-medium">Supplier</th>
                <th className="px-5 py-3 font-medium">Decision</th>
                <th className="px-5 py-3 font-medium text-right">Inspector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-zinc-500">No records found. Submit an inspection above.</td>
                </tr>
              ) : (
                records.map((record, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ui-transition">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{record.batchNumber}</div>
                      <div className="text-zinc-400 text-xs mt-0.5">{format(record.createdAt, 'MMM d, yyyy HH:mm')}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium">{record.category}</td>
                    <td className="px-5 py-3.5">{record.supplier}</td>
                    <td className="px-5 py-3.5">
                      {record.decision === 'Accepted' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Accepted
                        </span>
                      ) : record.decision === 'Rejected' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Quarantined
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-zinc-500">{record.inspector}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
