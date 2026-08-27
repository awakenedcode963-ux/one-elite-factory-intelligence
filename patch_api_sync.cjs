const fs = require('fs');
let code = fs.readFileSync('src/services/api.ts', 'utf8');

if (!code.includes('offlineSyncService')) {
  code = "import { enqueueRecord } from './offlineSyncService';\n" + code;
  
  const submitReplacement = `
export const submitInspection = async (targetModule: 'IQC' | 'IPQC_Extrusion' | 'IPQC_Injection' | 'Lab' | 'NCR' | 'Crusher' | 'Complaints', rowDataArray: any) => {
  if (!navigator.onLine) {
    await enqueueRecord(targetModule, rowDataArray, 'Unknown');
    return { status: 'offline_queued', message: 'تم حفظ الفحص محلياً في ذاكرة التابلت - سيتم المزامنة تلقائياً' };
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        module: targetModule,
        data: rowDataArray
      })
    });
    if (!response.ok) throw new Error("HTTP Status " + response.status);
    const result = await response.json();
    if (result.status !== 'success') {
      throw new Error(result.message || 'Unknown error');
    }
    return result;
  } catch (err: any) {
    // If fetch fails due to network error, queue it
    if (err.name === 'TypeError' || err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
      await enqueueRecord(targetModule, rowDataArray, 'Unknown');
      return { status: 'offline_queued', message: 'تم حفظ الفحص محلياً في ذاكرة التابلت - سيتم المزامنة تلقائياً' };
    }
    throw err;
  }
};
`;

  code = code.replace(/export const submitInspection = async \([\s\S]*?return result;\n  \} catch \(err\) \{\n    console\.error\("Error submitting inspection:", err\);\n    throw err;\n  \}\n\};/, submitReplacement.trim());
}

fs.writeFileSync('src/services/api.ts', code);
