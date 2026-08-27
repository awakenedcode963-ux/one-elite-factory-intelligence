import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ClipboardCheck, Factory, Gauge, FlaskConical, BarChart3, AlertOctagon, Recycle, MessageSquare, LogOut, Settings, Sun, Moon, Globe, Crown, Menu, X, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../lib/LanguageContext';
import { useTheme } from '../lib/ThemeContext';
import clsx from 'clsx';
import { FlowerOfLifeLogo } from './FlowerOfLifeLogo';
import { NetworkSyncBadge } from './NetworkSyncBadge';

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    const handleToast = (e: any) => {
      setToast(e.detail);
      setTimeout(() => setToast(null), 5000);
    };
    window.addEventListener('polo_toast', handleToast);
    return () => window.removeEventListener('polo_toast', handleToast);
  }, []);

  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  const baseNavItems = [
    { to: '/production', label: language === 'ar' ? 'التخطيط والإنتاج' : 'Production PPC', icon: Layers },
    { to: '/', label: t('nav.overview'), icon: Factory, exact: true },
    { to: '/iqc', label: t('nav.iqc'), icon: ClipboardCheck },
    { to: '/ipqc', label: t('nav.ipqc'), icon: Gauge },
    { to: '/final-qc', label: t('nav.fqc'), icon: FlaskConical },
    { to: '/calibration', label: t('nav.metrology'), icon: Settings },
    { to: '/analytics', label: t('nav.analytics'), icon: BarChart3 },
    { to: '/ncr', label: t('nav.ncr'), icon: AlertOctagon },
    { to: '/crusher', label: t('nav.crusher'), icon: Recycle },
    { to: '/complaints', label: t('nav.complaints'), icon: MessageSquare },
  ];

  const navItems = (user?.role === 'Executive' || user?.role === 'QA Manager') 
    ? [{ to: '/executive', label: language === 'ar' ? 'لوحة الإدارة العليا' : 'Executive Dashboard', icon: Crown }, ...baseNavItems]
    : baseNavItems;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden print:h-auto print:overflow-visible print:bg-white text-zinc-900 dark:text-zinc-100 print:text-black">
      {/* Top Toolbar */}
      <header className="print-hide h-16 shrink-0 flex items-center justify-between px-3 sm:px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 z-10 ui-transition flex-nowrap">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
              <FlowerOfLifeLogo className="w-8 h-8 sm:w-9 sm:h-9" animate />
            </div>
            <div className="hidden sm:flex flex-col">
              <h1 className="text-base font-bold tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                CODEX ELITE™
              </h1>
              <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-0.5">
                QualityOS | POLO EGYPT
              </span>
            </div>
          </div>
          
          <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden lg:block ms-2 me-2 shrink-0"></div>
          
          {/* Status Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-200/50 dark:border-emerald-500/20 shrink-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[11px] font-bold tracking-wide text-emerald-700 dark:text-emerald-400 uppercase">ISO 9001:2015 CERTIFIED</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Controls */}
          <div className="hidden min-[400px]:flex items-center gap-2 sm:gap-3 sm:pe-4 sm:border-e border-zinc-200 dark:border-zinc-800 shrink-0">
            {/* Language Segmented Control */}
            <div className="relative flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full p-1 border border-zinc-200/50 dark:border-zinc-700/50">
              <button
                onClick={() => setLanguage('ar')}
                className={clsx(
                  "relative z-10 text-[10px] sm:text-[11px] font-medium px-2 sm:px-3 py-1 rounded-full ui-transition",
                  language === 'ar' ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                AR
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={clsx(
                  "relative z-10 text-[10px] sm:text-[11px] font-medium px-2 sm:px-3 py-1 rounded-full ui-transition",
                  language === 'en' ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                EN
              </button>
              {/* Slider Pill */}
              <div 
                className="absolute top-1 bottom-1 w-1/2 bg-white dark:bg-zinc-700 shadow-sm rounded-full transition-transform duration-200 ease-out"
                style={{ transform: language === 'ar' ? 'translateX(0%)' : (document.documentElement.dir === 'rtl' ? 'translateX(-100%)' : 'translateX(100%)') }}
              ></div>
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 ui-transition active:scale-[0.97] outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 shrink-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />
              ) : (
                <Moon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />
              )}
            </button>
          </div>
          
          {/* Sync Badge */}
          <NetworkSyncBadge />

          {/* User & Logout */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-zinc-300 dark:ring-zinc-600">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user?.name || 'User'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] sm:text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  {user?.name?.[0] || user?.username?.[0] || 'U'}
                </span>
              )}
            </div>
            <button
              onClick={logout}
              className="flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors outline-none focus-visible:underline shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t('layout.logout')}</span>
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button 
            className="lg:hidden p-1.5 sm:p-2 -me-1 sm:-me-2 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shrink-0"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden print:overflow-visible relative">
        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={closeMobileMenu}
          />
        )}

        {/* Sidebar Navigation */}
        <aside className={clsx(
          "print-hide flex flex-col shrink-0 border-e border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 ui-transition",
          "fixed inset-y-0 z-50 w-64 lg:static lg:flex lg:w-64 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          document.documentElement.dir === 'rtl'
            ? (isMobileMenuOpen ? "right-0 translate-x-0" : "right-0 translate-x-full lg:translate-x-0")
            : (isMobileMenuOpen ? "left-0 translate-x-0" : "left-0 -translate-x-full lg:translate-x-0")
        )}>
          {/* Mobile Sidebar Header with Close Button */}
          <div className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
            <span className="text-sm font-bold tracking-wider text-amber-600 dark:text-amber-400">MENU</span>
            <button 
              onClick={closeMobileMenu}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto py-4 px-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={closeMobileMenu}
                className={({ isActive }) => clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ui-transition active:scale-[0.97] outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100",
                  isActive 
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm" 
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
            
            {/* Mobile-only tools in sidebar */}
            <div className="lg:hidden mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between px-3">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('layout.language') || 'Language'}</span>
                <div className="flex gap-2">
                  <button onClick={() => setLanguage('ar')} className={clsx("text-xs font-bold px-2 py-1 rounded", language === 'ar' ? "bg-zinc-200 dark:bg-zinc-700" : "")}>AR</button>
                  <button onClick={() => setLanguage('en')} className={clsx("text-xs font-bold px-2 py-1 rounded", language === 'en' ? "bg-zinc-200 dark:bg-zinc-700" : "")}>EN</button>
                </div>
              </div>
              <div className="flex items-center justify-between px-3">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('layout.theme') || 'Theme'}</span>
                <button onClick={toggleTheme} className="p-1 rounded bg-zinc-100 dark:bg-zinc-800">
                   {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>{t('layout.logout')}</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 min-w-0 w-full overflow-x-hidden p-3 sm:p-6 print:overflow-visible print:p-0 bg-zinc-50 dark:bg-zinc-950 print:bg-white print:text-black ui-transition relative">
          <div className="max-w-6xl mx-auto h-full">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
}
