const fs = require('fs');
let code = fs.readFileSync('src/pages/ModuleIPQC.tsx', 'utf8');

code = code.replace(/const \{ user \} = useAuth\(\);\s*const \{ user \} = useAuth\(\);/, "const { user } = useAuth();");

fs.writeFileSync('src/pages/ModuleIPQC.tsx', code);
