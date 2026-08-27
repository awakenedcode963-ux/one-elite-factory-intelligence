import { ProductMaster, DefectMaster, CalibrationMaster, MachineMaster, DimensionMaster, PackagingMaster, EmployeeMaster, MasterData, User } from '../types/qms';
import { fetchMasterData, submitInspection } from '../services/api';
import React, { useState } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { ClipboardCheck, Gauge, AlertOctagon, Settings, Plus, Recycle, Activity, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { format } from 'date-fns';

export function Overview() {
  const { language } = useLanguage();

  const stats = [
    { 
      name: language === 'ar' ? 'فحوصات الوردية اليوم' : 'Total Shift Inspections', 
      value: '142', 
      icon: ClipboardCheck, 
      trend: '+12% vs last shift', 
      type: 'success' 
    },
    { 
      name: language === 'ar' ? 'الماكينات المراقبة حالياً' : 'Active Machines Monitored', 
      value: '24', 
      icon: Gauge, 
      trend: '8 Extrusion / 16 Injection', 
      type: 'neutral' 
    },
    { 
      name: language === 'ar' ? 'تقارير عدم المطابقة المفتوحة' : 'Open NCRs Count', 
      value: '3', 
      icon: AlertOctagon, 
      trend: '2 Major / 1 Minor', 
      type: 'danger' 
    },
    { 
      name: language === 'ar' ? 'تنبيهات المعايرة' : 'Calibration Alerts', 
      value: '1', 
      icon: Settings, 
      trend: 'Vernier Caliper #102 due soon', 
      type: 'warning' 
    },
  ];

  const quickActions = [
    { name: language === 'ar' ? 'فحص جودة خطوط الإنتاج (IPQC)' : 'New IPQC Inspection', to: '/ipqc', icon: Gauge, color: 'bg-indigo-500' },
    { name: language === 'ar' ? 'فحص الخامات الواردة (IQC)' : 'New IQC Check', to: '/iqc', icon: ClipboardCheck, color: 'bg-emerald-500' },
    { name: language === 'ar' ? 'تسجيل هالك كسارات' : 'Log Crusher Scrap', to: '/crusher', icon: Recycle, color: 'bg-amber-500' },
  ];

  const recentLogs = [
    { id: '1', inspector: 'Ahmed Ali', type: 'IPQC - Extrusion', target: 'Line 1 - PPR 20mm', status: 'Passed', time: new Date(Date.now() - 1000 * 60 * 5) },
    { id: '2', inspector: 'Sarah Omar', type: 'IQC - Raw Material', target: 'Borealis RA130E', status: 'Passed', time: new Date(Date.now() - 1000 * 60 * 22) },
    { id: '3', inspector: 'Mohamed Tarek', type: 'IPQC - Injection', target: 'Machine 4 - UPVC Elbow', status: 'Failed (NCR)', time: new Date(Date.now() - 1000 * 60 * 45) },
    { id: '4', inspector: 'Ahmed Ali', type: 'Crusher Scrap', target: 'Extrusion Startup Scrap', status: 'Logged', time: new Date(Date.now() - 1000 * 60 * 120) },
    { id: '5', inspector: 'Kareem Sayed', type: 'IPQC - Extrusion', target: 'Line 2 - UPVC 110mm', status: 'Passed', time: new Date(Date.now() - 1000 * 60 * 180) },
  ];

  const getStatusColor = (type: string) => {
    switch(type) {
      case 'danger': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'success': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'warning': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default: return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700';
    }
  };

  const getDotColor = (type: string) => {
    switch(type) {
      case 'danger': return 'bg-rose-500';
      case 'success': return 'bg-emerald-500';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-zinc-500';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {language === 'ar' ? 'نظرة عامة على العمليات' : 'Operational Overview'}
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          {language === 'ar' ? 'مركز العمليات اليومية للمفتشين والمشرفين' : 'Daily Operations Hub for Inspectors & Supervisors'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{item.name}</div>
              <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700/50">
                <item.icon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3 tracking-tight">{item.value}</div>
            <div className={clsx("inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border", getStatusColor(item.type))}>
              <span className={clsx("w-1.5 h-1.5 rounded-full", getDotColor(item.type))}></span>
              {item.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
          </h2>
          <div className="flex flex-col gap-3">
            {quickActions.map((action, i) => (
              <Link 
                key={i} 
                to={action.to}
                className="group relative flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-500 shadow-sm hover:shadow-md transition-all outline-none focus-visible:ring-2 focus-visible:ring-amber-500 active:scale-[0.98]"
              >
                <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner text-white", action.color)}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 text-start">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                    {action.name}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-amber-50 dark:group-hover:bg-amber-500/10 transition-colors text-zinc-400 group-hover:text-amber-500">
                  <Plus className="w-5 h-5" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Shift Logs Stream */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {language === 'ar' ? 'سجل فحص الوردية الحالي' : "Today's Shift Logs Stream"}
          </h2>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-xs border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-5 py-4 font-medium">{language === 'ar' ? 'الوقت' : 'Time'}</th>
                    <th className="px-5 py-4 font-medium">{language === 'ar' ? 'المفتش' : 'Inspector'}</th>
                    <th className="px-5 py-4 font-medium">{language === 'ar' ? 'نوع الفحص' : 'Type'}</th>
                    <th className="px-5 py-4 font-medium">{language === 'ar' ? 'الهدف / الصنف' : 'Target / Item'}</th>
                    <th className="px-5 py-4 font-medium text-right">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {recentLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="font-mono text-zinc-900 dark:text-zinc-100">{format(log.time, 'HH:mm')}</div>
                      </td>
                      <td className="px-5 py-3.5 font-medium">{log.inspector}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium">
                          {log.type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">{log.target}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={clsx(
                          "inline-flex items-center px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider",
                          log.status.includes('Passed') ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
                          log.status.includes('Failed') ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400" :
                          "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                        )}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-center items-center">
              <button className="text-xs font-medium text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors flex items-center gap-1">
                {language === 'ar' ? 'عرض السجل الكامل' : 'View Full History'} <ChevronRight className="w-3 h-3 rtl:-scale-x-100" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
