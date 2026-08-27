const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const replacement = `<header className="h-16 shrink-0 flex items-center justify-between px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 z-10 ui-transition">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow-sm shrink-0">
              <Factory className="w-4 h-4 text-white dark:text-zinc-900" />
            </div>
            <div className="hidden sm:flex flex-col">
              <h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                CODEX ELITE™ <span className="font-normal opacity-70">| QualityOS</span>
                <span className="text-[9px] font-medium bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded-sm">v4.2</span>
              </h1>
              <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                POLO EGYPT - Industrial Quality Intelligence
              </span>
            </div>
          </div>
          
          <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden lg:block ms-2 me-2"></div>
          
          {/* Status Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-200/50 dark:border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[11px] font-bold tracking-wide text-emerald-700 dark:text-emerald-400 uppercase">ISO 9001:2015 CERTIFIED</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          {/* Controls */}
          <div className="flex items-center gap-3 pe-4 border-e border-zinc-200 dark:border-zinc-800">
            {/* Language Segmented Control */}
            <div className="relative flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-full p-1 border border-zinc-200/50 dark:border-zinc-700/50">
              <button
                onClick={() => setLanguage('ar')}
                className={clsx(
                  "relative z-10 text-[11px] font-medium px-3 py-1 rounded-full ui-transition",
                  language === 'ar' ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                AR
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={clsx(
                  "relative z-10 text-[11px] font-medium px-3 py-1 rounded-full ui-transition",
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
              className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 ui-transition active:scale-[0.97] outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
            >
              {theme === 'dark' ? (
                <Sun className="w-[18px] h-[18px]" />
              ) : (
                <Moon className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>
          
          {/* User & Logout */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-zinc-300 dark:ring-zinc-600">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                </span>
              )}
            </div>
            <button
              onClick={logout}
              className="flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors outline-none focus-visible:underline"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('layout.logout')}</span>
            </button>
          </div>
        </div>
      </header>`;

const regex = /<header className="h-16 shrink-0 flex items-center justify-between[\s\S]*?<\/header>/;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/Layout.tsx', content);
