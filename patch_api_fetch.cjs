const fs = require('fs');

let content = fs.readFileSync('src/services/api.ts', 'utf8');

const oldFetch = `    const data = await response.json();
    cachedMasterData = data;`;
const newFetch = `    const data = await response.json();
    cachedMasterData = {
      ...data,
      machines: data.machines || [],
      employees: data.employees || []
    };
    return cachedMasterData;`;

content = content.replace(oldFetch, newFetch);

fs.writeFileSync('src/services/api.ts', content);
