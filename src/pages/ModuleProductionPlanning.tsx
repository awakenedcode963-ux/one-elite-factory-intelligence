import React, { useState, useEffect } from 'react';
import { X, Factory, Plus, Play, Pause, CheckCircle2, AlertTriangle, FileBarChart, Timer, RefreshCcw, Save, Trash2, Printer, StopCircle, Clock, Settings, Settings2, ShieldCheck, Activity } from 'lucide-react';
import { fetchMasterData, fetchWorkOrders, createWorkOrder, updateWorkOrder, logDowntime } from '../services/api';
import { WorkOrder, MasterData, MachineMaster, ProductMaster } from '../types/qms';
import clsx from 'clsx';
import { useLanguage } from '../lib/LanguageContext';

type Tab = 'ACTIVE_ORDERS' | 'ANALYTICS';

export function ModuleProductionPlanning() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('ACTIVE_ORDERS');
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isShiftLogModalOpen, setIsShiftLogModalOpen] = useState(false);
  const [isDowntimeModalOpen, setIsDowntimeModalOpen] = useState(false);
  const [selectedWo, setSelectedWo] = useState<WorkOrder | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const md = await fetchMasterData();
    setMasterData(md);
    const wos = await fetchWorkOrders() as WorkOrder[];
    setWorkOrders(wos);
    setLoading(false);
  };

  const handleStartWorkOrder = async (id: string) => {
    await updateWorkOrder(id, { status: 'RUNNING' });
    loadData();
  };

  const handleCompleteWorkOrder = async (id: string) => {
    await updateWorkOrder(id, { status: 'COMPLETED' });
    loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
      case 'ON_HOLD': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
      case 'COMPLETED': return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
      case 'QA_RELEASED': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800/50';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING': return <Activity className="w-4 h-4" />;
      case 'SCHEDULED': return <Clock className="w-4 h-4" />;
      case 'ON_HOLD': return <Pause className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle2 className="w-4 h-4" />;
      case 'QA_RELEASED': return <ShieldCheck className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 print:space-y-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print-hide">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Factory className="w-6 h-6 text-amber-600 dark:text-amber-500" />
            {language === 'ar' ? 'التخطيط والتحكم في الإنتاج (PPC)' : 'Production Planning & Control'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {language === 'ar' ? 'إدارة أوامر التشغيل، تتبع الأعطال وتحليل الكفاءة' : 'Manage work orders, track downtime, and analyze OEE'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'ar' ? 'طباعة التقرير' : 'Print Report'}</span>
          </button>
          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-amber-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'أمر تشغيل جديد' : 'New Work Order'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rtl:space-x-reverse bg-zinc-200/50 dark:bg-zinc-800/50 p-1 rounded-xl w-fit print-hide">
        <button
          onClick={() => setActiveTab('ACTIVE_ORDERS')}
          className={clsx(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            activeTab === 'ACTIVE_ORDERS'
              ? "bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-500 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
          )}
        >
          {language === 'ar' ? 'أوامر التشغيل الحالية' : 'Active Orders'}
        </button>
        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={clsx(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
            activeTab === 'ANALYTICS'
              ? "bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-500 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
          )}
        >
          <FileBarChart className="w-4 h-4" />
          {language === 'ar' ? 'تحليلات الإنتاج' : 'Analytics & OEE'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCcw className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      ) : (
        <>
          {activeTab === 'ACTIVE_ORDERS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {workOrders.map((wo) => {
                const progress = (wo.producedQuantity / wo.targetQuantity) * 100;
                return (
                  <div key={wo.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col shadow-sm">
                    {/* Card Header */}
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">{wo.orderNumber}</div>
                        <h3 className="font-bold text-zinc-900 dark:text-white line-clamp-1">{wo.productName}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                            Machine {wo.lineMachineId}
                          </span>
                          <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1", getStatusColor(wo.status))}>
                            {getStatusIcon(wo.status)}
                            {wo.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="p-4 space-y-4 flex-1">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-500 dark:text-zinc-400">Progress</span>
                          <span className="font-bold text-zinc-900 dark:text-white">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 transition-all duration-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                          <div className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Produced</div>
                          <div className="font-bold text-zinc-900 dark:text-white text-lg">
                            {wo.producedQuantity.toLocaleString()} <span className="text-xs font-normal text-zinc-500">{wo.unit}</span>
                          </div>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                          <div className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Target</div>
                          <div className="font-bold text-zinc-900 dark:text-white text-lg">
                            {wo.targetQuantity.toLocaleString()} <span className="text-xs font-normal text-zinc-500">{wo.unit}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Scrap: {wo.scrapQuantity} {wo.unit}
                        </div>
                        <div className="text-zinc-500 dark:text-zinc-400 font-medium">
                          Shift: {wo.shift}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-3 gap-2">
                      {wo.status === 'SCHEDULED' ? (
                        <button onClick={() => handleStartWorkOrder(wo.id)} className="col-span-3 flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
                          <Play className="w-4 h-4" /> Start Order
                        </button>
                      ) : wo.status === 'RUNNING' ? (
                        <>
                          <button onClick={() => { setSelectedWo(wo); setIsShiftLogModalOpen(true); }} className="flex flex-col items-center justify-center gap-1 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-medium transition-colors">
                            <Plus className="w-4 h-4" /> Log Output
                          </button>
                          <button onClick={() => { setSelectedWo(wo); setIsDowntimeModalOpen(true); }} className="flex flex-col items-center justify-center gap-1 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg text-xs font-medium transition-colors">
                            <StopCircle className="w-4 h-4" /> Downtime
                          </button>
                          <button onClick={() => handleCompleteWorkOrder(wo.id)} className="flex flex-col items-center justify-center gap-1 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-medium transition-colors">
                            <CheckCircle2 className="w-4 h-4" /> Complete
                          </button>
                        </>
                      ) : (
                        <div className="col-span-3 text-center py-2 text-sm font-medium text-zinc-500">
                          Order {wo.status.toLowerCase()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'ANALYTICS' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric Cards */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-2 text-zinc-500 dark:text-zinc-400">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-bold uppercase tracking-wider">Overall OEE</span>
                  </div>
                  <div className="text-3xl font-black text-zinc-900 dark:text-white">78.5%</div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-2 text-zinc-500 dark:text-zinc-400">
                    <Factory className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-bold uppercase tracking-wider">Active Lines</span>
                  </div>
                  <div className="text-3xl font-black text-zinc-900 dark:text-white">4 / 12</div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-2 text-zinc-500 dark:text-zinc-400">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-bold uppercase tracking-wider">Scrap Rate</span>
                  </div>
                  <div className="text-3xl font-black text-zinc-900 dark:text-white">2.1%</div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-2 text-zinc-500 dark:text-zinc-400">
                    <Timer className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-bold uppercase tracking-wider">Downtime (Mins)</span>
                  </div>
                  <div className="text-3xl font-black text-zinc-900 dark:text-white">145</div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Production vs Target</h3>
                <div className="h-64 flex items-end gap-2">
                  {/* Mock Chart Bars */}
                  {[60, 80, 40, 90, 75, 100, 85].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end group">
                      <div className="w-full bg-amber-500 rounded-t-sm transition-all duration-300 group-hover:bg-amber-400" style={{ height: `${val}%` }}></div>
                      <div className="text-center text-[10px] text-zinc-500 mt-2 font-medium">Day {i+1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* New Order Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">New Work Order</h2>
              <button onClick={() => setIsNewOrderModalOpen(false)} className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Machine</label>
                <select className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none">
                  <option value="">Select Machine...</option>
                  {masterData?.machines.map(m => (
                    <option key={m.Machine_ID} value={m.Machine_ID}>{m.Machine_Name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Product</label>
                <select className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none">
                  <option value="">Select Product...</option>
                  {masterData?.products.map(p => (
                    <option key={p.Product_Code} value={p.Product_Code}>{language === 'ar' ? p.Product_Name_AR : p.Product_Name_EN}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Target Quantity</label>
                  <input type="number" className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Unit</label>
                  <select className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="meters">Meters</option>
                    <option value="kg">Kilograms (kg)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-end gap-3">
              <button onClick={() => setIsNewOrderModalOpen(false)} className="px-4 py-2 text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-white transition-colors">Cancel</button>
              <button onClick={() => {
                  createWorkOrder({ orderNumber: 'PRD-NEW-001', lineMachineId: '101', productCode: '1600200', productName: 'New Work Order', targetQuantity: 1000, unit: 'pcs' }).then(() => {
                    setIsNewOrderModalOpen(false);
                    loadData();
                  });
              }} className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors">Create Order</button>
            </div>
          </div>
        </div>
      )}

      {/* Shift Log Modal */}
      {isShiftLogModalOpen && selectedWo && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Log Production</h2>
              <div className="text-xs text-zinc-500 mt-1">{selectedWo.orderNumber} - {selectedWo.productName}</div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Produced Quantity ({selectedWo.unit})</label>
                <input type="number" defaultValue={0} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-2xl font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-center" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Scrap Quantity ({selectedWo.unit})</label>
                <input type="number" defaultValue={0} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-lg font-bold text-red-600 dark:text-red-400 focus:ring-2 focus:ring-red-500 outline-none text-center" />
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <button onClick={() => setIsShiftLogModalOpen(false)} className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
              <button onClick={() => {
                updateWorkOrder(selectedWo.id, { producedQuantity: selectedWo.producedQuantity + 100 }).then(() => {
                  setIsShiftLogModalOpen(false);
                  loadData();
                });
              }} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors">Save Log</button>
            </div>
          </div>
        </div>
      )}

      {/* Downtime Modal */}
      {isDowntimeModalOpen && selectedWo && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-red-50 dark:bg-red-950/30">
              <h2 className="text-lg font-bold text-red-700 dark:text-red-400 flex items-center gap-2"><StopCircle className="w-5 h-5"/> Log Downtime</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Reason</label>
                <div className="grid grid-cols-2 gap-2">
                  {['MAINTENANCE', 'DIE_CHANGE', 'RAW_MATERIAL', 'ELECTRICAL'].map(reason => (
                    <button key={reason} className="py-2 px-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800 transition-colors">
                      {reason.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Duration (Minutes)</label>
                <input type="number" defaultValue={15} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xl font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none text-center" />
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 border-t border-zinc-100 dark:border-zinc-800">
              <button onClick={() => setIsDowntimeModalOpen(false)} className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
              <button onClick={() => { setIsDowntimeModalOpen(false); }} className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors">Log Stop</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
