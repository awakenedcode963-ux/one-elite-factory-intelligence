import { ProductMaster, DefectMaster, CalibrationMaster, MachineMaster, DimensionMaster, PackagingMaster, EmployeeMaster, MasterData, User } from '../types/qms';
import { fetchMasterData, submitInspection } from '../services/api';
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Clock, CheckCircle2, ChevronRight, Filter } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import clsx from 'clsx';

interface ProductQuickSelectProps {
  products: ProductMaster[];
  activeProcess: 'extrusion' | 'injection' | 'all';
  selectedMachine: string;
  value: string;
  onChange: (code: string) => void;
}

const CATEGORIES = [
  { id: 'all', labelEN: 'All Categories', labelAR: 'كل الفئات' },
  { id: 'ppr_pipes', labelEN: 'PPR Pipes', labelAR: 'مواسير PPR' },
  { id: 'upvc_pipes', labelEN: 'UPVC Pipes', labelAR: 'مواسير UPVC' },
  { id: 'ppr_fittings', labelEN: 'PPR Fittings', labelAR: 'قطع PPR' },
  { id: 'upvc_fittings', labelEN: 'UPVC Fittings', labelAR: 'قطع UPVC' }
];

const CLASSES = [
  { id: 'all', label: 'All Classes' },
  { id: 'pn20', label: 'PN20' },
  { id: 'pn16', label: 'PN16' },
  { id: 'pn10', label: 'PN10' },
  { id: 'class3', label: 'Class 3' },
  { id: 'class4', label: 'Class 4' }
];

export function ProductQuickSelect({ products, activeProcess, selectedMachine, value, onChange }: ProductQuickSelectProps) {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeClass, setActiveClass] = useState('all');
  const [lastInspected, setLastInspected] = useState<string | null>(null);

  // Mock fetching last inspected item from localStorage based on machine
  useEffect(() => {
    if (selectedMachine) {
      const stored = localStorage.getItem(`polo_last_product_${selectedMachine}`);
      if (stored) {
        setLastInspected(stored);
      } else {
        // Fallback to first available product for demo if nothing stored
        const processProducts = products.filter(p => p.Process_Type.toLowerCase() === activeProcess || activeProcess === 'all');
        if (processProducts.length > 0) {
          setLastInspected(String(processProducts[0].Product_Code));
        } else {
          setLastInspected(null);
        }
      }
    }
  }, [selectedMachine, products, activeProcess]);

  const handleSelect = (code: string) => {
    if (selectedMachine) {
      localStorage.setItem(`polo_last_product_${selectedMachine}`, code);
      setLastInspected(code);
    }
    onChange(code);
  };

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => p.Process_Type.toLowerCase() === activeProcess || activeProcess === 'all');

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        String(p.Product_Code).toLowerCase().includes(q) ||
        p.Product_Name_EN.toLowerCase().includes(q) ||
        p.Product_Name_AR.toLowerCase().includes(q)
      );
    }

    if (activeCategory !== 'all') {
      const catMatches = (name: string) => {
        const n = name.toLowerCase();
        if (activeCategory === 'ppr_pipes') return n.includes('ppr') && n.includes('pipe') || n.includes('ماسورة ppr');
        if (activeCategory === 'upvc_pipes') return n.includes('upvc') && n.includes('pipe') || n.includes('ماسورة upvc') || n.includes('hdpe');
        if (activeCategory === 'ppr_fittings') return n.includes('ppr') && (n.includes('fitting') || !n.includes('pipe'));
        if (activeCategory === 'upvc_fittings') return n.includes('upvc') && (n.includes('fitting') || !n.includes('pipe'));
        return true;
      };
      filtered = filtered.filter(p => catMatches(p.Product_Name_EN) || catMatches(p.Product_Name_AR));
    }

    if (activeClass !== 'all') {
      filtered = filtered.filter(p => p.Product_Name_EN.toLowerCase().includes(activeClass.replace('class', 'class ')));
    }

    return filtered;
  }, [products, activeProcess, searchTerm, activeCategory, activeClass]);

  const selectedProduct = products.find(p => String(p.Product_Code) === value);
  const lastProductInfo = products.find(p => String(p.Product_Code) === lastInspected);

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={language === 'ar' ? 'البحث السريع بالكود أو اسم الصنف...' : 'Instant fuzzy search by code or name...'}
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 ui-transition text-base"
        />
      </div>

      {/* Smart Machine Association */}
      {lastProductInfo && (
        <button 
          type="button"
          onClick={() => handleSelect(String(lastProductInfo.Product_Code))}
          className="w-full flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-left ui-transition active:scale-[0.99] hover:bg-amber-100 dark:hover:bg-amber-500/20"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-0.5">
                {language === 'ar' ? 'آخر صنف تم فحصه على هذا الخط' : 'Last Inspected Item on this Line'}
              </div>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {lastProductInfo.Product_Code} - {language === 'ar' ? lastProductInfo.Product_Name_AR : lastProductInfo.Product_Name_EN}
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-500 rtl:-scale-x-100" />
        </button>
      )}

      {/* Filters */}
      {!searchTerm && (
        <div className="space-y-3 pt-2">
          {/* Categories */}
          <div className="flex overflow-x-auto pb-2 -mx-2 px-2 snap-x hide-scrollbar space-x-2 rtl:space-x-reverse">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  "shrink-0 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ui-transition snap-start",
                  activeCategory === cat.id 
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm"
                    : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                )}
              >
                {language === 'ar' ? cat.labelAR : cat.labelEN}
              </button>
            ))}
          </div>

          {/* Pressure Classes */}
          <div className="flex flex-wrap gap-2">
            {CLASSES.map(cls => (
              <button
                key={cls.id}
                type="button"
                onClick={() => setActiveClass(cls.id)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-medium ui-transition",
                  activeClass === cls.id
                    ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                    : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                )}
              >
                {cls.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Results */}
      <div className="pt-2">
        <div className="text-xs font-medium text-zinc-500 mb-3 flex items-center justify-between">
          <span>{language === 'ar' ? 'النتائج المطابقة' : 'Matching Items'} ({filteredProducts.length})</span>
          {value && selectedProduct && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">
              <CheckCircle2 className="w-3 h-3" />
              {language === 'ar' ? 'تم الاختيار' : 'Selected'}: {selectedProduct.Product_Code}
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1 -m-1">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-8 text-center text-zinc-400 text-sm border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              {language === 'ar' ? 'لا يوجد نتائج مطابقة للبحث أو الفلتر' : 'No items match your search or filters.'}
            </div>
          ) : (
            filteredProducts.map(p => {
              const isSelected = String(p.Product_Code) === value;
              return (
                <button
                  key={p.Product_Code}
                  type="button"
                  onClick={() => handleSelect(String(p.Product_Code))}
                  className={clsx(
                    "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 text-center ui-transition active:scale-[0.97]",
                    isSelected
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10 shadow-sm"
                      : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-amber-300 dark:hover:border-amber-700"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-amber-500">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                  <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                    {p.Nominal_Dia_mm}<span className="text-xs text-zinc-500 font-normal">mm</span>
                  </span>
                  <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-tight">
                    {language === 'ar' ? p.Product_Name_AR : p.Product_Name_EN}
                  </span>
                  <span className="text-[9px] text-zinc-400 mt-1.5 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    {p.Product_Code}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
