const fs = require('fs');
const path = 'packages/domain/src/aggregate.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "  public static rehydrate(snapshot: InvestigationSnapshot): Investigation {",
  "  public static rehydrate(snapshot: InvestigationSnapshot): Investigation {\n    if (!snapshot || typeof snapshot.id !== 'string' || !snapshot.problem || typeof snapshot.problem !== 'object') {\n      throw new TypeError(\"Invalid structural snapshot\");\n    }"
);

fs.writeFileSync(path, content);
