const fs = require('fs');

let content = fs.readFileSync('src/pages/ModuleIPQC.tsx', 'utf8');

// 1. Add timer state
content = content.replace(
  "const [isSyncing, setIsSyncing] = useState(false);",
  "const [isSyncing, setIsSyncing] = useState(false);\n  const [minutesSinceLast, setMinutesSinceLast] = useState<number>(0);"
);

// 2. Add interval effect
const effectRegex = /return \(\) => unsubscribe\(\);\n  \}, \[\]\);/;
const effectReplacement = `return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      if (records.length > 0) {
        // Find most recent record for current tab and machine
        const relevantRecords = records.filter(r => r.type === activeTab && r.machine === machine);
        if (relevantRecords.length > 0) {
          const lastTime = relevantRecords[0].createdAt;
          const diffMs = Date.now() - lastTime;
          setMinutesSinceLast(Math.floor(diffMs / 60000));
        } else {
          setMinutesSinceLast(60); // Default to needing inspection if no records
        }
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [records, activeTab, machine]);`;
content = content.replace(effectRegex, effectReplacement);

// 3. Update the banner to show countdown
const bannerRegex = /<div className="mb-6 flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-500\/10 border border-amber-200 dark:border-amber-500\/20 rounded-xl">[\s\S]*?<\/div>/;
const bannerReplacement = `{minutesSinceLast >= 60 ? (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          <span className="text-sm font-medium text-rose-800 dark:text-rose-300 flex-1">
            {t('ipqc.routineReminder')} - {t('shared.approved') === 'معتمد' ? 'الفحص مطلوب الآن!' : 'Inspection Required Now!'}
          </span>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300 flex-1">
            {t('ipqc.routineReminder')}
          </span>
          <span className="text-sm font-bold text-amber-700 dark:text-amber-400 bg-amber-200/50 dark:bg-amber-900/50 px-2 py-1 rounded-md">
            {60 - minutesSinceLast} {t('shared.approved') === 'معتمد' ? 'دقيقة متبقية' : 'min left'}
          </span>
        </div>
      )}`;
content = content.replace(bannerRegex, bannerReplacement);

fs.writeFileSync('src/pages/ModuleIPQC.tsx', content);
