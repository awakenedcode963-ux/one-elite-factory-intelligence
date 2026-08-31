#!/bin/bash
set -u

echo "Running Negative Architectural Tests..."

run_test() {
  local name=$1
  local file=$2
  local content=$3
  
  echo -n "Test $name: "
  
  # backup
  cp "$file" "${file}.bak"
  
  # apply violation
  echo "$content" >> "$file"
  
  # run test
  if npx dependency-cruiser packages apps integrations --config .dependency-cruiser.js > /dev/null 2>&1; then
    echo "FAIL (Violation was NOT caught)"
    mv "${file}.bak" "$file"
    exit 1
  else
    echo "PASS (Violation caught)"
  fi
  
  # restore
  mv "${file}.bak" "$file"
}

run_test "DAL -> Domain" "packages/dal/src/index.ts" "import { InvestigationService } from '../../domain/src/index.js'; console.log(InvestigationService);"
run_test "Domain -> DAL" "packages/domain/src/index.ts" "import { PostgresInvestigationRepository } from '../../dal/src/index.js'; console.log(PostgresInvestigationRepository);"
run_test "Domain -> Adapters" "packages/domain/src/index.ts" "import { ADAPTERS_LOADED } from '../../adapters/src/index.js'; console.log(ADAPTERS_LOADED);"
run_test "Orchestrator -> Adapters" "packages/orchestrator/src/index.ts" "import { ADAPTERS_LOADED } from '../../adapters/src/index.js'; console.log(ADAPTERS_LOADED);"
run_test "Policy -> Domain" "packages/policy/src/index.ts" "import { InvestigationService } from '../../domain/src/index.js'; console.log(InvestigationService);"
run_test "Policy -> DAL" "packages/policy/src/index.ts" "import { PostgresInvestigationRepository } from '../../dal/src/index.js'; console.log(PostgresInvestigationRepository);"
run_test "Agent Runtime -> Domain" "packages/agent-runtime/src/index.ts" "import { InvestigationService } from '../../domain/src/index.js'; console.log(InvestigationService);"
run_test "Agent Runtime -> DAL" "packages/agent-runtime/src/index.ts" "import { PostgresInvestigationRepository } from '../../dal/src/index.js'; console.log(PostgresInvestigationRepository);"
run_test "Agents -> Domain" "packages/agents/src/index.ts" "import { InvestigationService } from '../../domain/src/index.js'; console.log(InvestigationService);"
run_test "Agents -> DAL" "packages/agents/src/index.ts" "import { PostgresInvestigationRepository } from '../../dal/src/index.js'; console.log(PostgresInvestigationRepository);"
run_test "Tools -> DAL" "packages/tools/src/index.ts" "import { PostgresInvestigationRepository } from '../../dal/src/index.js'; console.log(PostgresInvestigationRepository);"
run_test "API -> DAL" "apps/fi-api/src/index.ts" "import { PostgresInvestigationRepository } from '../../../packages/dal/src/index.js'; console.log(PostgresInvestigationRepository);"
run_test "Contracts -> Internal" "packages/contracts/src/index.ts" "import { AuthorizationEvaluator } from '../../policy/src/index.js'; console.log(AuthorizationEvaluator);"

echo "All Negative Tests Passed."
