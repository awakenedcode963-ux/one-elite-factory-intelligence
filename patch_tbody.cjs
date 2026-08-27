const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleIPQC.tsx', 'utf8');

const tbodyRegex = /<tbody[\s\S]*?<\/tbody>/;
const newTbody = `
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-zinc-500"><Loader2 className="w-5 h-5 animate-spin mx-auto opacity-50" /></td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-zinc-500">No records found.</td>
                </tr>
              ) : (
                records.map((record) => {
                  const isAccepted = !record.ncrTriggered && record.defectSeverity !== 'critical' && record.defectSeverity !== 'major';
                  
                  return (
                    <tr key={record.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ui-transition group">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">{format(new Date(record.createdAt), 'HH:mm')}</div>
                        <div className="text-zinc-400 text-xs mt-0.5">{format(new Date(record.createdAt), 'MMM d, yyyy')}</div>
                      </td>
                      <td className="px-5 py-3.5 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 ui-transition">
                        <div className="font-medium">{record.machine}</div>
                        <div className="text-zinc-500 text-xs">{record.productCode}</div>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
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
                      </td>
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
                      <td className="px-5 py-3.5">
                        <span className={clsx(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border",
                          isAccepted ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                        )}>
                          {isAccepted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          {isAccepted ? t('shared.accepted') : t('shared.rejected')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right flex justify-end gap-2">
                        {!record.qaSignedOffBy && (
                          <button
                            onClick={() => {
                              if (window.confirm('Sign off on this inspection?')) {
                                updateDoc(doc(db, 'ipqc_inspections', record.id!), {
                                  qaSignedOffBy: user?.name,
                                  qaSignedOffAt: Date.now()
                                });
                              }
                            }}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded text-[10px] font-semibold ui-transition active:scale-[0.97]"
                          >
                            {t('shared.qaSignOff')}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(record.id!)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 ui-transition"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
`;
code = code.replace(tbodyRegex, newTbody);
fs.writeFileSync('src/pages/ModuleIPQC.tsx', code);
