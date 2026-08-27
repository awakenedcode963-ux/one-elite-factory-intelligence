import { ProductMaster, DefectMaster, CalibrationMaster, MachineMaster, DimensionMaster, PackagingMaster, EmployeeMaster, MasterData } from '../types/qms';
import { fetchMasterData, submitInspection } from '../services/api';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { FlowerOfLifeLogo } from '../components/FlowerOfLifeLogo';
import { useLanguage } from '../lib/LanguageContext';
import { Lock, User as UserIcon, EyeOff, Eye, Loader2, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';

export function Login() {
  const { user, login } = useAuth();
  const { t, language } = useLanguage();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    if (user.role === 'Executive' || user.role === 'QA Manager') {
      return <Navigate to="/executive" replace />;
    }
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(username, pin);
    if (!success) {
      setError(language === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials');
      setLoading(false);
    }
  };

  const handleDemo = (u: string, p: string) => {
    setUsername(u);
    setPin(p);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Subtle golden radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <FlowerOfLifeLogo className="w-16 h-16 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]" animate />
        </div>
        <h2 className="text-center text-2xl font-bold tracking-widest text-amber-500 uppercase">
          Codex Elite™
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-zinc-400 uppercase tracking-widest">
          QualityOS | POLO EGYPT
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-zinc-900/80 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl border border-zinc-800/80 sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
                {language === 'ar' ? 'اسم المستخدم' : 'Username'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-2.5 ps-10 pe-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 sm:text-sm ui-transition"
                  placeholder="e.g. amostafa"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
                {language === 'ar' ? 'رمز الدخول (PIN)' : 'Security PIN'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  type={showPin ? "text" : "password"}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="block w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-2.5 ps-10 pe-10 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 sm:text-sm ui-transition font-mono tracking-widest"
                  placeholder="••••"
                  maxLength={4}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 end-0 pe-3 flex items-center text-zinc-500 hover:text-zinc-300"
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-zinc-950 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-zinc-900 ui-transition disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {language === 'ar' ? 'تسجيل الدخول' : 'Secure Sign-In'}
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-zinc-800">
             <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-zinc-900 text-zinc-500 uppercase tracking-widest">Demo Quick Access</span>
             </div>
             <div className="mt-4 grid grid-cols-1 gap-2">
                <button onClick={() => handleDemo('amostafa', '1111')} className="text-xs py-1.5 px-3 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 rounded-md border border-zinc-700/50 ui-transition text-left flex justify-between">
                  <span>[QA Manager] Ayman Mostafa</span>
                  <span className="text-zinc-500 font-mono">1111</span>
                </button>
                <button onClick={() => handleDemo('msayed', '2222')} className="text-xs py-1.5 px-3 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 rounded-md border border-zinc-700/50 ui-transition text-left flex justify-between">
                  <span>[QC Inspector] Mohamed Sayed</span>
                  <span className="text-zinc-500 font-mono">2222</span>
                </button>
                <button onClick={() => handleDemo('exec', '9999')} className="text-xs py-1.5 px-3 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 rounded-md border border-zinc-700/50 ui-transition text-left flex justify-between">
                  <span>[Executive] Management</span>
                  <span className="text-zinc-500 font-mono">9999</span>
                </button>
             </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 w-max mx-auto shadow-lg backdrop-blur-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">ISO 9001:2015 Assured</span>
        </div>
      </div>
    </div>
  );
}
