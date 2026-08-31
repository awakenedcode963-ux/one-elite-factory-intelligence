const fs = require('fs');

const path = 'packages/domain/src/entities.ts';
let content = fs.readFileSync(path, 'utf8');

// Hypothesis rehydrate
const hypRehydrate = `  public static rehydrate(state: HypothesisState): Hypothesis {
    const instance = new Hypothesis(state.id, state.description, state.createdAt);
    instance._status = state.status;
    instance._confidenceLevel = state.confidenceLevel;
    instance._score = state.score ? { ...state.score } : undefined;
    return instance;
  }
`;
content = content.replace(
  "  public getState(): HypothesisState {",
  hypRehydrate + "  public getState(): HypothesisState {"
);

// VerificationTest rehydrate
const verRehydrate = `  public static rehydrate(state: VerificationTestState): VerificationTest {
    const instance = new VerificationTest(state.id, state.targetHypothesisId, state.parameters, state.createdAt);
    instance._status = state.status;
    instance._actualResult = state.actualResult;
    instance._successful = state.successful;
    return instance;
  }
`;
content = content.replace(
  "  public getState(): VerificationTestState {",
  verRehydrate + "  public getState(): VerificationTestState {"
);

fs.writeFileSync(path, content);
