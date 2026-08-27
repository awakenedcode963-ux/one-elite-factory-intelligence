const fs = require('fs');

let content = fs.readFileSync('/app/applet/src/pages/ModuleIPQC.tsx', 'utf8');

content = content.replace(
  "await addDoc(collection(db, 'ipqc_inspections'), newRecord);",
  `await addDoc(collection(db, 'ipqc_inspections'), newRecord);
      
      // Dispatch to Google Apps Script
      const sheetName = activeTab === 'extrusion' ? 'IPQC_Extrusion' : 'IPQC_Injection';
      try {
        await submitInspection(sheetName, newRecord);
        // Show success toast
        alert(t('dashboard.actionRequired') === 'إجراء مطلوب' 
          ? "✅ تم ترحيل الفحص بنجاح إلى قاعدة بيانات Google Sheets"
          : "✅ Inspection successfully synced to Google Sheets");
      } catch (err) {
        console.error(err);
        alert(t('dashboard.actionRequired') === 'إجراء مطلوب' 
          ? "❌ تعذر الاتصال بالسيرفر، يرجى المحاولة مرة أخرى"
          : "❌ Failed to connect to server, please try again");
      }`
);

fs.writeFileSync('/app/applet/src/pages/ModuleIPQC.tsx', content);
