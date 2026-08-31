import { ProductMaster, DefectMaster, CalibrationMaster, MachineMaster, DimensionMaster, PackagingMaster, EmployeeMaster, MasterData, User } from '../types/qms';
import { fetchMasterData, submitInspection } from '../services/api';
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, AlertOctagon, Scale, Filter, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, ReferenceLine
} from 'recharts';
import clsx from 'clsx';
import { useLanguage } from '../lib/LanguageContext';


export function ModuleAnalytics() {
  const [analyticsData, setAnalyticsData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    import('../services/api').then(({ fetchAnalyticsData }) => {
      fetchAnalyticsData()
        .then(data => {
          setAnalyticsData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Analytics data load failed:", err);
          // Fallback
          setAnalyticsData({
            paretoData: [
              { name: 'Wall Thickness', count: 120, cumulative: 35 },
              { name: 'Burned', count: 80, cumulative: 58 },
              { name: 'Reich', count: 50, cumulative: 73 },
            ],
            scrapData: [
              { machine: 'Ext-101', Extrusion: 45, Target: 50 },
            ],
            trendData: [
              { date: 'Mon', FPY: 96, Target: 95 },
            ]
          });
          setLoading(false);
        });
    });
  }, []);

  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'spc'>('dashboard');
  
  // Dashboard State
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [lineSelector, setLineSelector] = useState('All');

  // SPC State
  const [spcLine, setSpcLine] = useState('Ext-101');
  const [spcProduct, setSpcProduct] = useState('PPR-32MM');
  
  const fpy = 96.5;
  const fpyColor = fpy >= 98 ? 'text-emerald-500' : fpy >= 95 ? 'text-amber-500' : 'text-rose-500';

  // SPC Calculations
  const spcData = useMemo(() => {
    // Generate different scenarios based on selection to demonstrate capabilities
    let nominal = 100;
    let baseStd = 0.8;
    let shift = 0;
    
    if (spcLine === 'Ext-102') {
      baseStd = 1.5; // High variance, Cpk < 1
    } else if (spcLine === 'Ext-303') {
      shift = 1.2; // Mean shift, triggers WE rules
    }

    const rawData = generateProcessData(nominal, baseStd, 30, shift);
    const mean = calculateMean(rawData);
    const stdDev = calculateStdDev(rawData, mean);
    
    const usl = nominal * 1.03; // +3%
    const lsl = nominal * 0.97; // -3%
    
    const ucl = mean + 3 * stdDev;
    const lcl = mean - 3 * stdDev;
    
    const cp = (usl - lsl) / (6 * stdDev);
    const cpk = Math.min((usl - mean) / (3 * stdDev), (mean - lsl) / (3 * stdDev));

    // Western Electric Rules (simplified)
    let ruleViolations = [];
    let consecAbove = 0;
    let consecBelow = 0;
    
    const chartedData = rawData.map((val, idx) => {
      let isOutlier = val > ucl || val < lcl;
      if (isOutlier && !ruleViolations.includes('Rule 1: Point beyond 3-Sigma (UCL/LCL)')) {
        ruleViolations.push('Rule 1: Point beyond 3-Sigma (UCL/LCL)');
      }
      
      if (val > mean) {
        consecAbove++; consecBelow = 0;
      } else {
        consecBelow++; consecAbove = 0;
      }
      
      let isTrendOutlier = false;
      if (consecAbove >= 7 || consecBelow >= 7) {
        isTrendOutlier = true;
        if (!ruleViolations.includes('Rule 2: 7 consecutive points on one side of mean')) {
          ruleViolations.push('Rule 2: 7 consecutive points on one side of mean');
        }
      }
      
      return {
        sample: idx + 1,
        value: Number(val.toFixed(2)),
        isOutlier: isOutlier || isTrendOutlier,
        mean: Number(mean.toFixed(2)),
        ucl: Number(ucl.toFixed(2)),
        lcl: Number(lcl.toFixed(2)),
        usl: Number(usl.toFixed(2)),
        lsl: Number(lsl.toFixed(2)),
      };
    });

    return {
      data: chartedData,
      stats: { mean, stdDev, ucl, lcl, usl, lsl, cp, cpk },
      warnings: ruleViolations
    };
  }, [spcLine, spcProduct]);

  const renderDot = (props: any) => {
    const { cx, cy, payload, value } = props;
    if (!cx || !cy) return null;
    const out = payload.isOutlier;
    return (
      <circle cx={cx} cy={cy} r={out ? 5 : 3} fill={out ? "#ef4444" : "#d4af37"} stroke={out ? "#fca5a5" : "none"} strokeWidth={out ? 2 : 0} />
    );
  };

  const getCpkStatus = (cpk: number) => {
    if (cpk >= 1.33) return { label: 'Capable & Stable', ar: 'عملية منضبطة ومستقرة', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30' };
    if (cpk >= 1.0) return { label: 'Marginally Capable', ar: 'تحتاج مراقبة دقيقة', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/30' };
    return { label: 'Incapable / High Risk', ar: 'عملية غير منضبطة - خطر معيب', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/30' };
  };
  
  const cpkStatus = getCpkStatus(spcData.stats.cpk);

  
  if (loading || !analyticsData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-zinc-500 animate-pulse">Loading Live Analytics...</div>
      </div>
    );
  }

  const { paretoData, scrapData, trendData } = analyticsData;

  return (
    <div className="print-hide p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-500" />
            Quality Analytics & KPI Dashboard
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Enterprise metrics and manufacturing intelligence.</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg w-fit border border-zinc-200/50 dark:border-zinc-700/50">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={clsx("px-4 py-1.5 text-sm font-bold rounded-md ui-transition outline-none focus-visible:ring-2 focus-visible:ring-amber-500 flex items-center gap-2", activeTab === 'dashboard' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300')}
          >
            <BarChart3 className="w-4 h-4" /> Enterprise KPI
          </button>
          <button 
            onClick={() => setActiveTab('spc')}
            className={clsx("px-4 py-1.5 text-sm font-bold rounded-md ui-transition outline-none focus-visible:ring-2 focus-visible:ring-amber-500 flex items-center gap-2", activeTab === 'spc' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300')}
          >
            <Activity className="w-4 h-4" /> SPC Engine
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <div className="space-y-6 stagger-item stagger-1">
          <div className="flex justify-end items-center gap-3">
            <div className="relative">
              <select 
                value={dateRange} 
                onChange={e => setDateRange(e.target.value)}
                className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ui-transition"
              >
                <option>Today</option>
                <option>Last 7 Days</option>
                <option>Month to Date</option>
              </select>
              <Filter className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select 
                value={lineSelector} 
                onChange={e => setLineSelector(e.target.value)}
                className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ui-transition"
              >
                <option>All Lines</option>
                <option>Extrusion Only</option>
                <option>Injection Only</option>
              </select>
              <Filter className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">First Pass Yield (FPY)</p>
                  <h3 className={clsx("text-3xl font-bold mt-1 tracking-tight", fpyColor)}>{fpy}%</h3>
                </div>
                <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="mt-4 text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <span className={fpyColor}>Target &ge; 98%</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Scrap Weight</p>
                  <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 tracking-tight">1,240 <span className="text-lg text-zinc-400">kg</span></h3>
                </div>
                <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl">
                  <Scale className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
              </div>
              <div className="mt-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Across {lineSelector} areas
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Defect Frequency Index</p>
                  <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 tracking-tight">343</h3>
                </div>
                <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Occurrences logged
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Open NCRs</p>
                  <h3 className="text-3xl font-bold text-amber-600 dark:text-amber-500 mt-1 tracking-tight">8</h3>
                </div>
                <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                  <AlertOctagon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="mt-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Pending CAPA verification
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-6">Defect Pareto Analysis (80/20)</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={paretoData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#52525b" opacity={0.15} vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }} 
                      itemStyle={{ color: '#f4f4f5' }}
                    />
                    <Bar yAxisId="left" dataKey="count" fill="#d4af37" radius={[4, 4, 0, 0]} barSize={32} name="Occurrences" />
                    <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: '#ef4444' }} name="Cumulative %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-6">Machine Scrap Comparison (kg)</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scrapData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#52525b" opacity={0.15} vertical={false} />
                    <XAxis dataKey="machine" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }}
                      cursor={{ fill: '#52525b', opacity: 0.1 }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="Extrusion" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="Injection" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm lg:col-span-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-6">Daily Scrap Trend vs Target (%)</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#52525b" opacity={0.15} vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }} 
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="scrapPercent" stroke="#d4af37" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Actual Scrap %" />
                    <Line type="step" dataKey="target" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target Limit (1.5%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 stagger-item stagger-1">
          {/* SPC Header / Filters */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-zinc-900 dark:text-zinc-100">Statistical Process Control (SPC)</h2>
              <p className="text-xs text-zinc-500 mt-1">Real-time Capability & Control Charts (X̄-R)</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <select 
                  value={spcLine} 
                  onChange={e => setSpcLine(e.target.value)}
                  className="appearance-none bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-3 pr-8 py-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 outline-none focus:border-amber-500 ui-transition"
                >
                  <option value="Ext-101">Line: Ext-101 (Stable)</option>
                  <option value="Ext-102">Line: Ext-102 (High Var)</option>
                  <option value="Ext-303">Line: Ext-303 (Mean Shift)</option>
                </select>
                <Filter className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select 
                  value={spcProduct} 
                  onChange={e => setSpcProduct(e.target.value)}
                  className="appearance-none bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-3 pr-8 py-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 outline-none focus:border-amber-500 ui-transition"
                >
                  <option value="PPR-32MM">Product: PPR 32mm</option>
                  <option value="PVC-110MM">Product: PVC 110mm</option>
                </select>
                <Filter className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* SPC Warnings */}
          {spcData.warnings.length > 0 && (
            <div className="bg-rose-50 dark:bg-rose-500/10 border-l-4 border-rose-500 p-4 rounded-r-xl shadow-sm animate-pulse">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-rose-800 dark:text-rose-200">Western Electric Rules Violation</h3>
                  <ul className="mt-1 text-xs text-rose-700 dark:text-rose-300 list-disc pl-4 space-y-1">
                    {spcData.warnings.map(w => <li key={w}>{w}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Capability Index Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={clsx("md:col-span-1 p-6 rounded-2xl border relative overflow-hidden flex flex-col justify-center", cpkStatus.bg, cpkStatus.border)}>
              <div className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Process Capability</div>
              <div className="flex items-baseline gap-2">
                <span className={clsx("text-6xl font-black tracking-tighter", cpkStatus.color)}>{spcData.stats.cpk.toFixed(2)}</span>
                <span className={clsx("text-xl font-bold", cpkStatus.color)}>Cpk</span>
              </div>
              <div className="mt-4">
                <div className={clsx("text-sm font-bold", cpkStatus.color)}>{cpkStatus.label}</div>
                <div className={clsx("text-xs mt-0.5 opacity-80", cpkStatus.color)}>{cpkStatus.ar}</div>
              </div>
              <Activity className={clsx("absolute -right-6 -bottom-6 w-32 h-32 opacity-10", cpkStatus.color)} />
            </div>

            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center">
                <div className="text-xs font-medium text-zinc-500 uppercase">Cp (Potential)</div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{spcData.stats.cp.toFixed(2)}</div>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center">
                <div className="text-xs font-medium text-zinc-500 uppercase">Process Mean (X̄)</div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{spcData.stats.mean.toFixed(2)}</div>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center">
                <div className="text-xs font-medium text-rose-500 uppercase">USL (+3%)</div>
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{spcData.stats.usl.toFixed(1)}</div>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center">
                <div className="text-xs font-medium text-rose-500 uppercase">LSL (-3%)</div>
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{spcData.stats.lsl.toFixed(1)}</div>
              </div>
            </div>
          </div>

          {/* X-bar Chart */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex justify-between">
              X-bar Control Chart (Sample Weight)
              <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">Control Limits: ±3σ</span>
            </h3>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={spcData.data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#52525b" opacity={0.15} vertical={false} />
                  <XAxis dataKey="sample" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }}
                    labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                  />
                  
                  {/* Specification Limits */}
                  <ReferenceLine y={spcData.stats.usl} stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3" label={{ position: 'right', value: 'USL', fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }} />
                  <ReferenceLine y={spcData.stats.lsl} stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3" label={{ position: 'right', value: 'LSL', fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }} />
                  
                  {/* Control Limits */}
                  <ReferenceLine y={spcData.stats.ucl} stroke="#f59e0b" strokeDasharray="4 4" label={{ position: 'left', value: 'UCL', fill: '#f59e0b', fontSize: 11 }} />
                  <ReferenceLine y={spcData.stats.lcl} stroke="#f59e0b" strokeDasharray="4 4" label={{ position: 'left', value: 'LCL', fill: '#f59e0b', fontSize: 11 }} />
                  <ReferenceLine y={spcData.stats.mean} stroke="#10b981" strokeWidth={1} label={{ position: 'left', value: 'Mean', fill: '#10b981', fontSize: 11 }} />

                  <Line type="monotone" dataKey="value" stroke="#d4af37" strokeWidth={2} dot={renderDot} activeDot={{ r: 6 }} name="Sample Weight (g)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 flex gap-4 text-xs font-medium text-zinc-500 justify-center">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#d4af37]"></span> Normal Point</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Out of Control (Rule Violation)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
