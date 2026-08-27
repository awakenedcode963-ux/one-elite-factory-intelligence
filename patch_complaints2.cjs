const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleComplaints.tsx', 'utf8');

const convertLogic = `  const handleConvertToNCR = (complaint: any) => {
    navigate(\`/ncr?source=complaint&ref=\${complaint.complaintId || complaint.id}\`, { 
      state: { 
        complaintData: complaint 
      }
    });
  };`;
code = code.replace(/  const handleConvertToNCR = \(complaintId: string\) => \{[\s\S]*?  \};/, convertLogic);

code = code.replace(/onClick=\{\(\) => handleConvertToNCR\(complaint\.id\)\}/, "onClick={() => handleConvertToNCR(complaint)}");

fs.writeFileSync('src/pages/ModuleComplaints.tsx', code);
