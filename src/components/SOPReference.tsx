import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { useLanguage } from '../lib/LanguageContext';

interface SOPReferenceProps {
  sopCode: string;
  title: string;
  criteria: string[];
}

export function SOPReference({ sopCode, title, criteria }: SOPReferenceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="mb-6 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl overflow-hidden ui-transition">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-0.5">{t('shared.sopRef')}: {sopCode}</div>
            <div className="text-sm font-medium text-blue-900 dark:text-blue-100">{title}</div>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-blue-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-blue-500" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-5 pb-4 pt-1 border-t border-blue-100 dark:border-blue-900/30 animate-in fade-in slide-in-from-top-2 duration-200">
          <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2 uppercase tracking-wider">{t('shared.mandatoryCriteria')}</h4>
          <ul className="space-y-2">
            {criteria.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
