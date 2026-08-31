import { ProductMaster, DefectMaster, CalibrationMaster, MachineMaster, DimensionMaster, PackagingMaster, EmployeeMaster, MasterData, User } from '../types/qms';
import { fetchMasterData, submitInspection } from '../services/api';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { AlertOctagon, Plus, CheckCircle2, AlertCircle, Loader2, FileSearch, ShieldCheck, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';
import { FlowerOfLifeLogo } from '../components/FlowerOfLifeLogo';

export function ModuleNCR() {
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
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    fetchMasterData().then(data => {
      if (data && data.employees) setEmployees(data.employees);
    }).catch(console.error);
    
    // Seed some mock NCRs for demonstration
    setRecords([
      {
        id: 'NCR-2026-001',
        title: 'Wall Thickness Out of Spec (Ext-101)',
        status: 'Open',
        createdAt: Date.now() - 86400000,
        assignee: 'Unassigned',
      },
      {
        id: 'NCR-2026-002',
        title: 'Short Shot on Fittings (Inj-202)',
        status: 'CAPA Assigned',
        createdAt: Date.now() - 172800000,
        assignee: 'Ahmed Ali',
      }
    ]);
  }, []);

  // Form State
  const [ncrTitle, setNcrTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // RCA - 5 Whys
  const [why1, setWhy1] = useState('');
  const [why2, setWhy2] = useState('');
  const [why3, setWhy3] = useState('');
  const [why4, setWhy4] = useState('');
  const [why5, setWhy5] = useState('');
  
  // RCA - Fishbone 6M
  const [fishboneCategory, setFishboneCategory] = useState('Machine');
  
  // CAPA
  const [containment, setContainment] = useState('');
  const [corrective, setCorrective] = useState('');
  const [preventive, setPreventive] = useState('');
  const [assignee, setAssignee] = useState('');
  const [targetDate, setTargetDate] = useState('');
  
  const [formStatus, setFormStatus] = useState('Open');


  const [searchParams] = useSearchParams();
  const location = useLocation();
  const source = searchParams.get('source');
  const ref = searchParams.get('ref');

  useEffect(() => {
    if (source === 'complaint' && ref) {
      const c = location.state?.complaintData;
      setNcrTitle(`Customer Complaint: ${c ? c.category : ''} - ${ref.slice(0, 8)}`);
      setDescription(`Escalated from Customer Complaint (ID: ${ref})\nCustomer: ${c?.customerName}\nLocation: ${c?.projectLocation}\nProduct: ${c?.productCode}\nIssue: ${c?.description}`);
      setIsFormOpen(true);
    }
  }, [source, ref, location.state]);



  const fishboneOptions = ['Man', 'Machine', 'Material', 'Method', 'Measurement', 'Environment'];
  const statusOptions = ['Open', 'Under Investigation', 'CAPA Assigned', 'Verification', 'Closed'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ncrTitle) {
      alert("NCR Title is mandatory.");
      return;
    }
    
    setIsSyncing(true);
    
    const record = {
      id: `NCR-2026-${String(records.length + 3).padStart(3, '0')}`,
      title: ncrTitle,
      description,
      rca: { why1, why2, why3, why4, why5, category: fishboneCategory },
      capa: { containment, corrective, preventive, assignee, targetDate },
      status: formStatus,
      creator: user?.name || 'Unknown',
      createdAt: Date.now()
    };

    try {
      await submitInspection('NCR', record);
      
      setRecords(prev => [record, ...prev]);
      
      setIsFormOpen(false);
      // Reset
      setNcrTitle(''); setDescription('');
      setWhy1(''); setWhy2(''); setWhy3(''); setWhy4(''); setWhy5('');
      setFishboneCategory('Machine');
      setContainment(''); setCorrective(''); setPreventive('');
      setAssignee(''); setTargetDate(''); setFormStatus('Open');
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Unable to save the record. No confirmation of persistence was received.");
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Closed':
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30";
      case 'Open':
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30";
      case 'Verification':
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30";
    }
  };

  return (
    <>
      <div className="print-hide p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-amber-500" />
            NCR & CAPA Governance Engine
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage Non-Conformance Reports and Corrective Actions.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 dark:bg-amber-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-amber-600 dark:hover:bg-amber-700 ui-transition active:scale-[0.97]"
        >
          {isFormOpen ? 'Close Form' : (
            <>
              <Plus className="w-4 h-4" />
              Issue New NCR
            </>
          )}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden ui-transition stagger-item stagger-1">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertOctagon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">NCR Generation & RCA</h2>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: NCR Info & RCA */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">1. Defect Description</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">NCR Title *</label>
                      <input type="text" required value={ncrTitle} onChange={e => setNcrTitle(e.target.value)} placeholder="E.g. Wall Thickness Out of Spec" className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Detailed Description</label>
                      <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 outline-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
                    <FileSearch className="w-4 h-4 text-amber-500" /> Root Cause Analysis (RCA)
                  </h3>
                  <div className="space-y-4 bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Fishbone 6M Category</label>
                      <select value={fishboneCategory} onChange={e => setFishboneCategory(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 outline-none">
                        {fishboneOptions.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">5-Whys Drill Down</label>
                      <input type="text" placeholder="Why 1?" value={why1} onChange={e => setWhy1(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 outline-none" />
                      <input type="text" placeholder="Why 2?" value={why2} onChange={e => setWhy2(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 outline-none ml-2" />
                      <input type="text" placeholder="Why 3?" value={why3} onChange={e => setWhy3(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 outline-none ml-4" />
                      <input type="text" placeholder="Why 4?" value={why4} onChange={e => setWhy4(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 outline-none ml-6" />
                      <input type="text" placeholder="Why 5 (Root Cause)?" value={why5} onChange={e => setWhy5(e.target.value)} className="w-full rounded-lg border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 px-3 py-1.5 text-sm text-amber-900 dark:text-amber-100 shadow-sm focus:border-amber-500 outline-none ml-8 font-medium" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: CAPA */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> CAPA Plan
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Immediate Containment (إجراء الاحتواء الفوري)</label>
                      <textarea rows={2} placeholder="E.g. Isolate batch, stop machine..." value={containment} onChange={e => setContainment(e.target.value)} className="w-full rounded-lg border border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/10 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-rose-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Corrective Action (الإجراء التصحيحي)</label>
                      <textarea rows={2} placeholder="Action to eliminate root cause..." value={corrective} onChange={e => setCorrective(e.target.value)} className="w-full rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Preventive Action (الإجراء الوقائي)</label>
                      <textarea rows={2} placeholder="Action to prevent recurrence globally..." value={preventive} onChange={e => setPreventive(e.target.value)} className="w-full rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/10 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-emerald-500 outline-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Assignee</label>
                    <select value={assignee} onChange={e => setAssignee(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 outline-none">
                      <option value="">Select Employee...</option>
                      {employees.map(emp => (
                        <option key={emp.Employee_Name} value={emp.Employee_Name}>{emp.Employee_Name} - {emp.Role}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Target Date</label>
                    <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 outline-none [color-scheme:light] dark:[color-scheme:dark]" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Lifecycle Status</label>
                    <select value={formStatus} onChange={e => setFormStatus(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-amber-500 outline-none font-bold">
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-8 flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                QA Manager Verification required for Closure.
              </div>
              <div className="flex items-center gap-3">
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
                  {isSyncing ? 'Saving NCR...' : 'Save NCR & CAPA'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* NCR Register Table */}
      <div className="bg-white dark:bg-zinc-900 flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden ui-transition stagger-item stagger-2">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">NCR Register</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3 font-medium">NCR ID & Date</th>
                <th className="px-5 py-3 font-medium">Issue Title</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Assignee</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-zinc-500">No active NCRs found.</td>
                </tr>
              ) : (
                records.map((record, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ui-transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{record.id}</div>
                      <div className="text-zinc-400 text-xs mt-0.5">{format(record.createdAt, 'MMM d, yyyy')}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium">{record.title}</td>
                    <td className="px-5 py-3.5">
                      <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border", getStatusBadge(record.status))}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400">{record.assignee || 'Unassigned'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button className="text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 font-medium text-xs ui-transition outline-none">
                        View / Edit
                      </button>
                      
                      {(user?.role === 'QA Manager' || user?.role === 'Executive') && (
                        <button onClick={() => handlePrint(record)} className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium text-xs ui-transition outline-none flex items-center justify-end gap-1 ml-4 inline-flex">
                          <Printer className="w-3.5 h-3.5" /> طباعة تقرير NCR
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
          <div className="flex justify-between items-start border-b-2 border-rose-600 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <FlowerOfLifeLogo className="w-16 h-16 text-rose-600" animate={false} />
              <div>
                <h1 className="text-2xl font-bold text-black uppercase tracking-widest">CODEX ELITE™</h1>
                <h2 className="text-sm font-bold text-zinc-600 uppercase tracking-widest">QualityOS | POLO EGYPT</h2>
                <p className="text-xs text-zinc-500 mt-1">ISO 9001:2015 CERTIFIED</p>
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold text-black uppercase">NCR & 8D Investigation</h3>
              <h4 className="text-lg font-bold text-rose-700 font-cairo">تقرير حالة عدم مطابقة وتحقيق أسباب</h4>
              <p className="text-sm text-zinc-500 mt-2 font-mono">ID: {printingRecord.id}</p>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-sm font-bold text-white bg-zinc-800 px-4 py-1.5 uppercase mb-4">Non-Conformance Details</h4>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div className="space-y-3">
                <div className="flex justify-between border-b border-zinc-100 pb-1"><span className="text-zinc-600">NCR Title:</span> <span className="font-bold text-black">{printingRecord.title}</span></div>
                <div className="flex justify-between border-b border-zinc-100 pb-1"><span className="text-zinc-600">Status:</span> <span className="font-bold text-black">{printingRecord.status}</span></div>
                <div className="flex justify-between border-b border-zinc-100 pb-1"><span className="text-zinc-600">Assignee:</span> <span className="font-bold text-black">{printingRecord.assignee || 'Unassigned'}</span></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-zinc-100 pb-1"><span className="text-zinc-600">Report Date:</span> <span className="font-bold text-black">{format(printingRecord.createdAt, 'MMM dd, yyyy')}</span></div>
                <div className="flex justify-between border-b border-zinc-100 pb-1"><span className="text-zinc-600">Creator:</span> <span className="font-bold text-black">{printingRecord.creator || '-'}</span></div>
              </div>
            </div>
            {printingRecord.description && (
               <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200 text-sm">
                 <strong className="block mb-1 text-zinc-700">Detailed Description:</strong>
                 <p>{printingRecord.description}</p>
               </div>
            )}
          </div>

          <div className="mb-8">
            <h4 className="text-sm font-bold text-white bg-zinc-800 px-4 py-1.5 uppercase mb-4">Root Cause Analysis (RCA)</h4>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                 <p className="text-zinc-600 mb-2">Fishbone Category (6M):</p>
                 <p className="font-bold text-lg">{printingRecord.rca?.category || '-'}</p>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2"><span className="font-bold w-12">Why 1:</span> <span>{printingRecord.rca?.why1 || '-'}</span></div>
                <div className="flex gap-2"><span className="font-bold w-12 text-zinc-400">Why 2:</span> <span>{printingRecord.rca?.why2 || '-'}</span></div>
                <div className="flex gap-2"><span className="font-bold w-12 text-zinc-400">Why 3:</span> <span>{printingRecord.rca?.why3 || '-'}</span></div>
                <div className="flex gap-2"><span className="font-bold w-12 text-zinc-400">Why 4:</span> <span>{printingRecord.rca?.why4 || '-'}</span></div>
                <div className="flex gap-2 border-t border-zinc-200 pt-1 mt-1"><span className="font-bold w-12 text-rose-600">Root:</span> <span className="font-bold">{printingRecord.rca?.why5 || '-'}</span></div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-sm font-bold text-white bg-zinc-800 px-4 py-1.5 uppercase mb-4">CAPA Action Matrix</h4>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-4 gap-4 border-b border-zinc-200 pb-3">
                 <div className="font-bold text-zinc-700 col-span-1">Immediate Containment<br/><span className="text-xs font-normal font-cairo">إجراء الاحتواء الفوري</span></div>
                 <div className="col-span-3 bg-zinc-50 p-2">{printingRecord.capa?.containment || '-'}</div>
              </div>
              <div className="grid grid-cols-4 gap-4 border-b border-zinc-200 pb-3">
                 <div className="font-bold text-zinc-700 col-span-1">Corrective Action<br/><span className="text-xs font-normal font-cairo">الإجراء التصحيحي</span></div>
                 <div className="col-span-3 bg-zinc-50 p-2">{printingRecord.capa?.corrective || '-'}</div>
              </div>
              <div className="grid grid-cols-4 gap-4 border-b border-zinc-200 pb-3">
                 <div className="font-bold text-zinc-700 col-span-1">Preventive Action<br/><span className="text-xs font-normal font-cairo">الإجراء الوقائي</span></div>
                 <div className="col-span-3 bg-zinc-50 p-2">{printingRecord.capa?.preventive || '-'}</div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t-2 border-zinc-200">
            <div className="grid grid-cols-2 gap-16 text-center">
              <div>
                <div className="h-16 border-b border-dashed border-zinc-400 mb-2"></div>
                <p className="font-bold text-sm text-black">Production Manager</p>
                <p className="text-xs text-zinc-500">Sign & Date</p>
              </div>
              <div>
                <div className="h-16 border-b border-dashed border-zinc-400 mb-2"></div>
                <p className="font-bold text-sm text-black">QA Lead (Verification)</p>
                <p className="text-xs text-zinc-500">Sign & Date</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
