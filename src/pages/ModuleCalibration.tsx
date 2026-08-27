import { ProductMaster, DefectMaster, CalibrationMaster, MachineMaster, DimensionMaster, PackagingMaster, EmployeeMaster, MasterData, User } from '../types/qms';
import { fetchMasterData, submitInspection } from '../services/api';
import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Settings2, Plus, AlertCircle, CheckCircle2, Loader2, Calendar } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { useLanguage } from '../lib/LanguageContext';
import clsx from 'clsx';
import { SOPReference } from '../components/SOPReference';

export interface InstrumentRecord {
  id?: string;
  name: string;
  serialNumber: string;
  dueDate: string; // YYYY-MM-DD
  createdAt: number;
}

export function ModuleCalibration() {
  const { t } = useLanguage();
  const [instruments, setInstruments] = useState<InstrumentRecord[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchMasterData().then(data => {
      const mapped = data.calibration.map(c => ({
        id: c.Equipment_Tag,
        name: c.Equipment_Name,
        serialNumber: c.Equipment_Tag,
        dueDate: c.Next_Due_Date.substring(0, 10),
        createdAt: Date.now()
      }));
      setInstruments(mapped);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const newRecord = {
        name,
        serialNumber,
        dueDate,
        createdAt: Date.now()
      };
      await addDoc(collection(db, 'metrology_instruments'), newRecord);
      
      setIsFormOpen(false);
      setName('');
      setSerialNumber('');
      setDueDate('');
    } catch (error) {
      console.error("Error saving instrument: ", error);
      alert(error instanceof Error ? error.message : "Unable to save the record. No confirmation of persistence was received.");
    } finally {
      setIsSaving(false);
    }
  };

  const checkIsExpired = (dateStr: string) => {
    const date = new Date(dateStr);
    return isPast(date) && !isToday(date);
  };

  return (
    <div className="w-full">
      <div className="sm:flex sm:items-end sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
            <Settings2 className="w-6 h-6 text-zinc-400" />
            {t('metrology.title')}
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            {t('metrology.subtitle')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:flex-none">
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-4 py-2.5 text-sm font-medium text-white dark:text-zinc-900 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950 ui-transition active:scale-[0.97]"
          >
            <Plus className="w-4 h-4" />
            {t('metrology.newInstrument')}
          </button>
        </div>
      </div>

      <SOPReference 
        sopCode="SOP-QC-03" 
        title="Metrology & Calibration Standards"
        criteria={[
          "All measuring instruments must be uniquely identified (Serial No).",
          "Instruments past their due date must be marked EXPIRED and disabled in forms.",
          "Perform daily verification on frequently used gauges."
        ]}
      />

      {isFormOpen && (
        <div className="mb-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden ui-transition">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t('metrology.newInstrument')}</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3 text-sm">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{t('metrology.name')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Digital Caliper 150mm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{t('metrology.serial')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SN-2023-45"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{t('metrology.dueDate')}</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400 outline-none transition-shadow"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 ui-transition"
              >
                {t('iqc.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-5 py-2.5 text-sm font-medium text-white dark:text-zinc-900 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 ui-transition active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('iqc.save')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t('metrology.logs')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-xs border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3 font-medium">{t('metrology.name')}</th>
                <th className="px-5 py-3 font-medium">{t('metrology.serial')}</th>
                <th className="px-5 py-3 font-medium">{t('metrology.dueDate')}</th>
                <th className="px-5 py-3 font-medium text-center">{t('metrology.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-sm text-zinc-500"><Loader2 className="w-5 h-5 animate-spin mx-auto opacity-50" /></td>
                </tr>
              ) : instruments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-sm text-zinc-500">No instruments found.</td>
                </tr>
              ) : (
                instruments.map((record) => {
                  const expired = checkIsExpired(record.dueDate);
                  return (
                    <tr key={record.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ui-transition group">
                      <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-100">
                        {record.name}
                      </td>
                      <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                        {record.serialNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-zinc-400" />
                          <span className={clsx("font-medium", expired ? "text-rose-600 dark:text-rose-400" : "text-zinc-700 dark:text-zinc-300")}>
                            {format(new Date(record.dueDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {expired ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {t('metrology.expired')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t('metrology.valid')}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
