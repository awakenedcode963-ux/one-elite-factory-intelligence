import { ProductMaster, DefectMaster, CalibrationMaster, MachineMaster, DimensionMaster, PackagingMaster, EmployeeMaster, MasterData, User } from '../types/qms';
import { fetchMasterData, submitInspection } from '../services/api';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, AlertTriangle, ShieldCheck, CheckCircle2, TrendingUp, DollarSign, Send, FileWarning, Search, Camera } from 'lucide-react';
 
 
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { format } from 'date-fns';

export function ModuleComplaints() {
  const { user } = useAuth();
  const loggerName = user?.name || '';
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [masterData, setMasterData] = useState<{ products: ProductMaster[] }>({ products: [] });
  
  const [customerName, setCustomerName] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [invoiceBatch, setInvoiceBatch] = useState('');
  const [productCode, setProductCode] = useState('');
  const [category, setCategory] = useState('Leakage under Pressure');
  const [description, setDescription] = useState('');
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    fetchMasterData().then(data => {
      setMasterData({ products: data.products });
    });

    const q = query(collection(db, 'customer_complaints'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComplaints(data);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    try {
      const complaintId = `CMP-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const dateStr = new Date().toISOString();
      const labDisposition = '';
      const ncrRef = '';
      const status = 'investigating';
      
      const newRecord = {
        complaintId,
        customerName,
        projectLocation,
        invoiceBatch,
        productCode,
        category,
        description,
        status,
        loggedBy: loggerName,
        disposition: labDisposition,
        createdAt: Date.now()
      };
      
      
      
      await submitInspection('Complaints', newRecord);
      
      setCustomerName('');
      setProjectLocation('');
      setInvoiceBatch('');
      setProductCode('');
      setCategory('Leakage under Pressure');
      setDescription('');
      setShowSuccess(true); setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Unable to save the record. No confirmation of persistence was received.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConvertToNCR = (complaint: any) => {
    navigate(`/ncr?source=complaint&ref=${complaint.complaintId || complaint.id}`, { 
      state: { 
        complaintData: complaint 
      }
    });
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
          <MessageSquare className="w-6 h-6 text-zinc-400" />
          سجل شكاوى ومردودات العملاء (Customer Complaints & RMA)
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Log complaints, drive technical lab investigations, and track RMAs.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{complaints.length}</div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">Total Logged</div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">84%</div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">Closed within SLA</div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">45.2K</div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">Replacement Value (EGP)</div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">92%</div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">CSAT Rate</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Form */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <FileWarning className="w-4 h-4 text-rose-500" />
            Register Complaint
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Logged By / Inspector</label>
              <input type="text" disabled value={loggerName} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm text-zinc-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Customer / Trader Name</label>
              <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Project Location</label>
              <input required type="text" value={projectLocation} onChange={e => setProjectLocation(e.target.value)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Invoice / Batch Number</label>
              <input required type="text" value={invoiceBatch} onChange={e => setInvoiceBatch(e.target.value)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Product Code</label>
              <select value={productCode} onChange={e => setProductCode(e.target.value)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-amber-500">
                <option value="">Select Product...</option>
                {masterData.products.map(p => (
                  <option key={p.Product_Code} value={p.Product_Code}>{p.Product_Name_EN} ({p.Product_Code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Complaint Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-amber-500">
                <option>Leakage under Pressure</option>
                <option>Dimensional Mismatch</option>
                <option>Color Deviation</option>
                <option>Brittleness / Impact Failure</option>
                <option>Packaging Damage</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Description</label>
              <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-amber-500 resize-none" />
            </div>
            <div className="pt-2">
              <button type="button" className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-md text-sm text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ui-transition">
                <Camera className="w-4 h-4" />
                Upload Evidence Photos
              </button>
            </div>
            
            {showSuccess && (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl flex items-start gap-2 text-sm font-semibold ui-transition">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Complaint Logged Successfully. Escalated to Quality Lab.</span>
              </div>
            )}
            
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
               <button
                  type="submit"
                  disabled={isSyncing}
                  className="w-full flex justify-center items-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-5 py-2.5 text-sm font-medium text-white dark:text-zinc-900 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 ui-transition"
                >
                  <Send className="w-4 h-4" />
                  {isSyncing ? 'Logging...' : 'Submit Complaint'}
                </button>
            </div>
          </form>
        </div>

        {/* Complaints Investigation Board */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {complaints.map(complaint => (
            <div key={complaint.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 flex flex-col sm:flex-row gap-5">
               <div className="flex-1">
                 <div className="flex items-center justify-between mb-2">
                   <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
                     {complaint.category}
                   </span>
                   <span className="text-xs text-zinc-500">{format(new Date(complaint.createdAt), 'MMM d, yyyy - HH:mm')}</span>
                 </div>
                 <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">{complaint.customerName}</h3>
                 <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">{complaint.description}</p>
                 
                 <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
                   <div className="text-zinc-500">Location: <span className="font-medium text-zinc-900 dark:text-zinc-100">{complaint.projectLocation}</span></div>
                   <div className="text-zinc-500">Invoice: <span className="font-medium text-zinc-900 dark:text-zinc-100">{complaint.invoiceBatch}</span></div>
                 </div>
               </div>
               
               <div className="w-full sm:w-64 shrink-0 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between">
                 <div>
                   <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-1.5">
                     <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                     Lab Investigation
                   </h4>
                   <select className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs outline-none focus:border-amber-500 mb-3" defaultValue={complaint.disposition || ""}>
                     <option value="" disabled>Pending Technical Review...</option>
                     <option value="defect">Legitimate Manufacturing Defect</option>
                     <option value="misuse">Misuse / Improper Installation</option>
                     <option value="transport">Transport Damage</option>
                   </select>
                 </div>
                 
                 <button
                   onClick={() => handleConvertToNCR(complaint)}
                   className="w-full py-1.5 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 rounded text-xs font-semibold ui-transition border border-rose-200 dark:border-rose-500/20"
                 >
                   <AlertTriangle className="w-3.5 h-3.5" />
                   تحويل إلى تذكرة عدم مطابقة (Convert to NCR)
                 </button>
               </div>
            </div>
          ))}
          {complaints.length === 0 && (
             <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-12 flex flex-col items-center justify-center text-zinc-500">
               <Search className="w-8 h-8 mb-3 opacity-20" />
               <p>No complaints logged yet.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
