const fs = require('fs');
const path = 'packages/domain/src/aggregate.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { DomainEvent,",
  "import { InvestigationSnapshot } from './snapshots.js';\nimport { DomainEvent,"
);

content = content.replace(
  "  constructor(id: string, problem: ProblemDefinition) {",
  "  constructor(id: string, problem: ProblemDefinition, isRehydration: boolean = false) {"
);

content = content.replace(
  "    this.addEvent(new InvestigationOpened(this.id, this._problem));",
  "    if (!isRehydration) {\n      this.addEvent(new InvestigationOpened(this.id, this._problem));\n    }"
);

const rehydrateMethod = `
  // --- REHYDRATION SEAM ---
  public static rehydrate(snapshot: InvestigationSnapshot): Investigation {
    // 1. Explicit controlled construction path via normal constructor using flag
    const instance = new Investigation(snapshot.id, snapshot.problem, true);

    // 2. Direct mapping of internal state
    instance._status = snapshot.status;
    
    // 3. Reconstruct collections safely (deep cloning where needed)
    instance._evidence = new Map(
      snapshot.evidence.map(e => [
        e.id, 
        { ...e, provenance: { ...e.provenance } }
      ])
    );

    instance._hypotheses = new Map(
      snapshot.hypotheses.map(h => [
        h.id, 
        Hypothesis.rehydrate(h)
      ])
    );

    instance._verifications = new Map(
      snapshot.verifications.map(v => [
        v.id, 
        VerificationTest.rehydrate(v)
      ])
    );

    instance._rootCause = snapshot.rootCause 
      ? { ...snapshot.rootCause } 
      : undefined;

    // 4. Ensure events remain completely empty
    instance._events = [];

    return instance;
  }
`;

content = content.replace(
  "  // Properties (Read-Only access to state)",
  rehydrateMethod + "\n  // Properties (Read-Only access to state)"
);

fs.writeFileSync(path, content);
