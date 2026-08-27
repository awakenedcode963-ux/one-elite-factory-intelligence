# ONE ELITE — POLO QMS
# OE-QMS-003.1 — Architecture Amendments & Freeze

Status:
ARCHITECTURE FREEZE — PENDING GATE 3 IMPLEMENTATION

Authority:
ONE ELITE Chief Systems Architect

Target:
POLO QMS

Protected Reference:
POLO NCR — READ ONLY

Date:
2026-08-27

==================================================
1. PURPOSE
==================================================
This document formally amends OE-QMS-003 and freezes the architectural decisions required before Gate 3.

OE-QMS-003 was reviewed by the Chief Architect and approved WITH CONDITIONS.

OE-QMS-003.1 records those conditions.

No implementation is authorized by this document.

==================================================
2. PROTECTED REPOSITORY RULE
==================================================
POLO NCR is a protected principal/reference project.

It is READ-ONLY.

POLO QMS must not become technically dependent on POLO NCR.

POLO NCR knowledge may be used only for domain learning, historical reference, and architectural comparison.

Clearly distinguish:
KNOWLEDGE REUSE
from:
CODE REUSE.

The latter is prohibited.

==================================================
3. PRODUCTION ORDER TRACEABILITY ANCHOR
==================================================
Freeze Production Order as the primary manufacturing traceability anchor.

Canonical relationship:
Production Order
    |
    +-- Product
    +-- Machine
    +-- Production Run
    +-- Material Batch
    +-- IQC
    +-- IPQC
    +-- FQC
    +-- Scrap/Regrind
    +-- Quality Findings
    +-- NCR
    +-- CAPA

Quality records associated with manufacturing must preserve the Production Order reference whenever applicable.

==================================================
4. FINDING vs QUALITY EVENT vs NCR
==================================================
Freeze the distinction:

Finding:
An observation, failed measurement, deviation, or abnormality.

Quality Event:
A governed quality occurrence requiring standardized traceability or escalation.

NCR:
A formal non-conformance requiring the NCR lifecycle.

Do NOT treat every failed inspection measurement as an NCR.

Canonical flow:
Inspection
    ↓
Finding / Failure
    ↓
Business Rule Evaluation
    ↓
NCR Required?
    ├── NO → Local corrective action
    └── YES → NCR

Escalation rules will be defined by the QMS domain.

==================================================
5. NCR CLOSURE AUTHORITY
==================================================
Freeze:

NCR Closure Owner = QA.

Do NOT assume QA Manager unless the organizational RBAC configuration explicitly defines that authority later.

Canonical lifecycle:
OPEN
→ UNDER INVESTIGATION
→ ACTION REQUIRED
→ VERIFICATION
→ CLOSED

Verification:
EFFECTIVE
→ CLOSED

NOT EFFECTIVE or PARTIALLY EFFECTIVE
→ ACTION REQUIRED

Operators must not close NCRs.

==================================================
6. NCR REPORTING CONTEXT
==================================================
Freeze the following principles.

Mandatory initial fields:
- Date
- NCR Type
- Severity
- Description
- Immediate Action

Conditionally required when associated with manufacturing:
- Production Order
- Product
- Machine
- Quantity Affected

Optional/contextual:
- Shift
- Department
- Evidence/Photo

Product Size / DN remains QA-owned and must not be an operator-entered field in the initial reporting workflow.

Preserve:
Minimum Cognitive Load
Bilingual Arabic/English UX
Role separation

==================================================
7. CALIBRATION SNAPSHOT
==================================================
Freeze the calibration model.

Calibration states:
VALID
EXPIRING
EXPIRED
FAILED
UNDER_CALIBRATION

Inspection records must preserve:
Instrument_ID + Calibration_Snapshot_Status

The current calibration status must NOT overwrite the historical status that existed when the inspection occurred.

Based on the current business decision:
EXPIRED or FAILED calibration does not automatically block the inspection.
The condition must be visible and auditable.

==================================================
8. REGRIND CONTROL
==================================================
Freeze:
Default threshold = 5%

The threshold must be configurable.

Rule:
Regrind <= configured threshold
→ AUTO_APPROVED

Regrind > configured threshold
→ WARNING
→ PENDING_SUPERVISOR_APPROVAL

Supervisor approval is required before the record becomes approved.
Do NOT hard-code the 5% value into domain logic.

==================================================
9. OFFLINE ARCHITECTURE AMENDMENT
==================================================
Explicitly prohibit storing Firebase authentication tokens inside the offline queue.

The offline queue may retain:
- Local Operation ID
- Entity Type
- Entity Payload
- Authenticated User ID
- Created At
- Intended Action
- Idempotency Key
- Schema Version

The queue must distinguish:
PERSISTED
QUEUED
FAILED

Never:
FAILED → SUCCESS
without actual successful persistence.

When synchronization occurs:
Queue → Current authenticated session → Authorization → Idempotency validation → Persistence

An expired authentication session must not be silently treated as successful.

==================================================
10. SCHEMA VERSIONING
==================================================
Every persisted transactional/domain record must support:
schema_version

Explain why:
- migrations
- offline records
- historical interpretation
- backward compatibility
- auditing

require explicit schema versioning.
Do not implement this yet.

==================================================
11. IDEMPOTENCY
==================================================
Every write operation that may be retried must support:
idempotency_key

Purpose:
Prevent duplicate records caused by:
- network retry
- double submission
- offline synchronization
- browser retry
- interrupted requests

The same logical operation must never create duplicate business records.

==================================================
12. HEXAGONAL / REPOSITORY ARCHITECTURE
==================================================
Freeze the intended dependency direction:
UI
↓
Application Use Case
↓
Domain
↓
Repository Interface
↓
Persistence Adapter
↓
Firestore

React components must not become the canonical owner of persistence logic.
Firestore must remain an implementation adapter rather than the domain model itself.

==================================================
13. ONE ELITE BOUNDARY
==================================================
ONE ELITE owns platform-level concerns:
- Identity
- Authentication
- Authorization
- Shared user identity
- Shared organizational identity
- Platform audit capabilities
- Platform governance

POLO QMS owns:
- QMS Master Data
- Quality Operations
- Inspections
- Findings
- NCR
- CAPA
- Complaints
- Calibration
- QMS-specific quality rules
- QMS workflows

Do not duplicate platform identity or authorization inside QMS.

==================================================
14. MASTER DATA OWNERSHIP
==================================================
Platform-owned:
- User identity
- Employee identity
- Facility identity

QMS-owned:
- Products
- Product Specifications
- Defects
- Machines where QMS-specific
- Instruments
- Suppliers
- Materials

Clearly distinguish identity records from QMS master data.

==================================================
15. AUDIT MODEL
==================================================
Critical lifecycle transitions must generate immutable audit information containing:
- Actor
- Action
- Entity Type
- Entity ID
- Previous State
- New State
- Timestamp
- Reason/Evidence when required

Approval is distinct from authentication.
Authentication: Who are you?
Authorization: What are you allowed to do?
Approval: Who approved the business decision?

==================================================
16. POLO NCR KNOWLEDGE BOUNDARY
==================================================
Record the following as reusable domain knowledge:
- NCR operational context
- 5 Whys
- 6M Fishbone
- CAPA
- five-stage NCR lifecycle
- Verification regression
- QA ownership of DN/Product Size
- bilingual operator UX
- minimum cognitive load
- accountability by lifecycle stage

Explicitly reject as architecture:
- Google Sheets relational simulation
- Apps Script onEdit state machine
- HTML form injection
- legacy spreadsheet deployment model
- disconnected authentication
- legacy implementation dependencies

==================================================
17. GATE 3 PRECONDITIONS
==================================================
Gate 3 implementation must NOT begin until:
1. OE-QMS-003.1 is reviewed.
2. Architecture freeze is accepted.
3. Protected repository boundary is preserved.
4. No unresolved contradiction exists between ONE ELITE governance and POLO QMS architecture.
5. Security architecture is approved.
6. Authentication strategy is approved.
7. Authorization model is approved.
8. Firestore schema strategy is approved.

==================================================
18. IMPLEMENTATION SEQUENCE
==================================================
After architectural approval:
Gate 3: Security / Identity / Authorization
Gate 4: Canonical Master Data
Gate 5: Quality Transactions
Gate 6: NCR / CAPA / Complaint Workflows
Gate 7: Analytics

No phase may silently bypass the architectural boundaries.

==================================================
19. CURRENT STATUS
==================================================
POLO QMS remains an application under architectural transformation.

The existing UI is not considered proof of production readiness.

Mock persistence, insecure authentication, fake success, schema mismatches, and client-only workflow enforcement remain implementation concerns to be addressed in later gates.

OE-QMS-003.1 does not fix them.
It freezes the architecture that will govern their remediation.

==================================================
20. CHIEF ARCHITECT DECISION
==================================================
OE-QMS-003:
APPROVED WITH CONDITIONS

OE-QMS-003.1:
ARCHITECTURAL AMENDMENT + FREEZE

Implementation:
NOT AUTHORIZED BY THIS DOCUMENT

POLO NCR:
PROTECTED / READ ONLY

POLO QMS:
ACTIVE TARGET PROJECT

ONE ELITE:
ARCHITECTURAL GOVERNANCE AUTHORITY

==================================================
21. FINAL SAFETY CHECK
==================================================
[x] Only POLO QMS repository was modified.
[x] No source code was modified.
[x] No Firebase configuration was modified.
[x] No Firestore rules were modified.
[x] No authentication code was modified.
[x] No UI was modified.
[x] No patch files were deleted.
[x] No deployment occurred.
[x] POLO NCR was not modified.
[x] No POLO NCR commit/push occurred.
[x] No POLO NCR file was deleted.
