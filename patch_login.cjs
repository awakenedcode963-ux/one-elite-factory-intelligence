const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf8');

const loginRedirect = `  if (user) {
    if (user.role === 'Executive' || user.role === 'QA Manager') {
      return <Navigate to="/executive" replace />;
    }
    return <Navigate to="/" replace />;
  }`;

code = code.replace(/  if \(user\) \{\n    return <Navigate to="\/" replace \/>;\n  \}/, loginRedirect);
fs.writeFileSync('src/pages/Login.tsx', code);
