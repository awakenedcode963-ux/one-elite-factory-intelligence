const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleIPQC.tsx', 'utf8');

// For Shift Summary, the table cell should display Average Weight instead of Deviation, and Total quantities instead of scrap.
const originalCellRegex = /\{record\.type === 'extrusion' \? \([\s\S]*?\) : \([\s\S]*?\}\)/;
const replacementCell = `
                        {record.type === 'shift_summary' ? (
                          <>
                            Avg: {record.averageWeight}kg<br/>
                            Acc: {record.acceptedMeters} | Rej: {record.rejectedMeters}
                          </>
                        ) : record.type === 'extrusion' ? (
                          <>
                            Dev: <span className={Math.abs(record.weightDeviation || 0) > 5 ? 'text-rose-500' : ''}>{record.weightDeviation}%</span><br/>
                            Scrap: <span className={record.scrapRate > 2 ? 'text-rose-500' : ''}>{record.scrapRate.toFixed(1)}%</span>
                          </>
                        ) : (
                          <>
                            Scrap: <span className={record.scrapRate > 2 ? 'text-rose-500' : ''}>{record.scrapRate.toFixed(1)}%</span><br/>
                            R: {record.runnerWeight}kg | F: {record.flashWeight}kg
                          </>
                        )}
`;
code = code.replace(originalCellRegex, replacementCell);

// Also replace the Defect Type cell to display the inspector/shift info for shift_summary
const originalDefectCellRegex = /<td className="px-5 py-3\.5">\s*<span className=\{clsx\([\s\S]*?\{record\.defectType\}\s*<\/span>\s*<\/td>/;
const replacementDefectCell = `
                      <td className="px-5 py-3.5">
                        {record.type === 'shift_summary' ? (
                          <div className="text-xs text-zinc-500">
                            {record.shift}<br/>
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">{record.reportedInspectorName}</span>
                          </div>
                        ) : (
                          <span className={clsx(
                            "inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium border",
                            record.defectSeverity === 'critical' ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" :
                            record.defectSeverity === 'major' ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" :
                            record.defectSeverity === 'minor' ? "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700" :
                            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          )}>
                            {record.defectType}
                          </span>
                        )}
                      </td>
`;
code = code.replace(originalDefectCellRegex, replacementDefectCell);

fs.writeFileSync('src/pages/ModuleIPQC.tsx', code);
