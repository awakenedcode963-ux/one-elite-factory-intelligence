const fs = require('fs');
let content = fs.readFileSync('/app/applet/src/pages/ModuleIPQC.tsx', 'utf8');

const oldMap = `                  {defectsList.map((defect) => (
                    <label key={defect.id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="defectType"
                        value={defect.id}
                        checked={defectType === defect.id}
                        onChange={(e) => setDefectType(e.target.value)}
                        className="sr-only"
                      />
                      <div className={clsx(
                        "px-4 py-2 rounded-lg border text-sm font-medium ui-transition",
                        defectType === defect.id
                          ? defect.severity === 'critical' ? "bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                          : defect.severity === 'major' ? "bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                          : defect.severity === 'minor' ? "bg-zinc-100 border-zinc-500 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300"
                          : "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400"
                      )}>
                        {defect.id === 'none' ? t('ipqc.noDefect') : defect.label}
                      </div>
                    </label>
                  ))}`;

const newMap = `                  {[{ Defect_Code: 'none', Defect_Name_EN: 'None (Conforming)', Defect_Name_AR: 'مطابق بدون عيوب', Severity_Level: 'None' }, ...defectsList].map((defect) => {
                    const codeId = String(defect.Defect_Code);
                    const severity = String(defect.Severity_Level).toLowerCase();
                    return (
                    <label key={codeId} className="cursor-pointer">
                      <input
                        type="radio"
                        name="defectType"
                        value={codeId}
                        checked={defectType === codeId}
                        onChange={(e) => setDefectType(e.target.value)}
                        className="sr-only"
                      />
                      <div className={clsx(
                        "px-4 py-2 rounded-lg border text-sm font-medium ui-transition",
                        defectType === codeId
                          ? severity === 'critical' ? "bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                          : severity === 'major' ? "bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                          : (severity === 'minor' || severity === 'process scrap') ? "bg-zinc-100 border-zinc-500 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300"
                          : "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400"
                      )}>
                        {codeId === 'none' ? t('ipqc.noDefect') : \`\${codeId} - \${t('shared.approved') === 'معتمد' ? defect.Defect_Name_AR : defect.Defect_Name_EN}\`}
                      </div>
                    </label>
                  )})}`;

content = content.replace(oldMap, newMap);
fs.writeFileSync('/app/applet/src/pages/ModuleIPQC.tsx', content);
