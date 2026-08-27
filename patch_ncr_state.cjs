const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleNCR.tsx', 'utf8');

if (!code.includes("useLocation")) {
    code = code.replace(/import \{ useSearchParams \} from 'react-router-dom';/, "import { useSearchParams, useLocation } from 'react-router-dom';");
}

const stateLogic = `
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const source = searchParams.get('source');
  const ref = searchParams.get('ref');

  useEffect(() => {
    if (source === 'complaint' && ref) {
      const c = location.state?.complaintData;
      setNcrTitle(\`Customer Complaint: \${c ? c.category : ''} - \${ref.slice(0, 8)}\`);
      setDescription(\`Escalated from Customer Complaint (ID: \${ref})\\nCustomer: \${c?.customerName}\\nLocation: \${c?.projectLocation}\\nProduct: \${c?.productCode}\\nIssue: \${c?.description}\`);
      setIsFormOpen(true);
    }
  }, [source, ref, location.state]);
`;

code = code.replace(/  const \[searchParams\] = useSearchParams\(\);[\s\S]*?  \}, \[source, ref\]\);/, stateLogic);

fs.writeFileSync('src/pages/ModuleNCR.tsx', code);
