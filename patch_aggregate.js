const fs = require('fs');

const path = 'packages/domain/src/aggregate.ts';
let content = fs.readFileSync(path, 'utf8');

// Add import
content = content.replace(
  "import { DomainEvent, ",
  "import { InvestigationSnapshot } from './snapshots.js';\nimport { DomainEvent, "
);

// Add rehydrate method inside Investigation class
const rehydrateMethod = `
  // --- REHYDRATION SEAM ---
  public static rehydrate(snapshot: InvestigationSnapshot): Investigation {
    // 1. Bypass public constructor side-effects using an explicitly controlled internal construction path.
    // Instead of Object.create, we use a private constructor bypass pattern if possible.
    // Since we cannot easily add a private constructor without modifying the public one's signature,
    // and we must not use Object.create, we will call the public constructor with a dummy problem,
    // and then manually overwrite all state and CLEAR the events.
    // Wait, the instructions say: "DO NOT use 'Object.create(Investigation.prototype)' as the default implementation mechanism. The implementation must use an explicit, controlled construction path owned by the Aggregate itself."
    // Let's add a private static property to flag rehydration to bypass event emission in constructor.
  }
`;
