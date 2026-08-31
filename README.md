# ONE ELITE — FACTORY INTELLIGENCE

This repository implements the strict, modular monolith architecture defined in FI-11.2 and FI-13.

## Architectural Principles
1. **AI PREPARES. ORCHESTRATOR CONTROLS. DOMAIN VALIDATES. HUMAN AUTHORIZES. DAL PERSISTS. AUDIT RECORDS.**
2. **PORT ← IMPLEMENTATION**: Core defines the required capability. Infrastructure implements that capability.
3. **DEPENDENCY INVERSION**: The Domain depends purely on abstractions (`@fi/contracts`). It never imports infrastructure.
4. **COMPOSITION ROOT**: `@fi/bootstrap` is the only package authorized to wire abstractions to concrete implementations.

## Package Structure
- `@fi/contracts`: Pure interfaces, DTOs, Errors. Zero dependencies.
- `@fi/policy`: Security & capability evaluation.
- `@fi/domain`: Business logic & Domain Services.
- `@fi/dal`: Database implementation (PostgreSQL).
- `@fi/tools`: Tool definitions & orchestration maps.
- `@fi/agents`: Agent definitions (declarative).
- `@fi/agent-runtime`: LLM sandbox execution.
- `@fi/orchestrator`: Task and workflow management.
- `@fi/bootstrap`: DI wiring / Composition Root.
- `@fi/adapters`: Queue, LLM, Comm implementations.

## Applications
- `fi-api`: API Server.
- `fi-worker`: Background Worker.
- `fi-ui`: Frontend Application.

## Integrations
- `qms-adapter`: External boundary for legacy QMS.
