const fs = require('fs');
let content = fs.readFileSync('/app/applet/src/pages/ModuleIQC.tsx', 'utf8');

const regex = /\/\/ 2\. Sync to Google Sheets[\s\S]*?setIsFormOpen\(false\);/m;
const replacement = `// 2. Sync to Google Sheets
      try {
        const yieldRate = calculateYield(total, rejected);
        const timestamp = format(new Date(newRecord.createdAt), 'yyyy-MM-dd HH:mm:ss');
        const rowData = [
          timestamp,
          batchNumber,
          materialType,
          supplier,
          total,
          newRecord.inspectedQuantity,
          rejected,
          yieldRate + '%',
          coaVerified ? 'Yes' : 'No',
          visualInspectionPassed ? 'Pass' : 'Fail',
          notes
        ];
        await submitInspection('IQC', rowData);
        // Show success toast
        alert(t('shared.approved') === 'معتمد' 
          ? "✅ تم ترحيل الفحص بنجاح إلى قاعدة بيانات Google Sheets"
          : "✅ Inspection successfully synced to Google Sheets");
      } catch (err) {
        console.error(err);
        alert(t('shared.approved') === 'معتمد' 
          ? "❌ تعذر الاتصال بالسيرفر، يرجى المحاولة مرة أخرى"
          : "❌ Failed to connect to server, please try again");
      }

      setIsFormOpen(false);`;

content = content.replace(regex, replacement);
fs.writeFileSync('/app/applet/src/pages/ModuleIQC.tsx', content);
