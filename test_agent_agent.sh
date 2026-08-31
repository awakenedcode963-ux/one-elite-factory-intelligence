#!/bin/bash
set -u
mkdir -p packages/agents/src/agent-a packages/agents/src/agent-b
echo "export const Something = true;" > packages/agents/src/agent-a/index.ts
echo "import { Something } from '../agent-a/index.js'; console.log(Something);" > packages/agents/src/agent-b/index.ts
if npx dependency-cruiser packages apps integrations --config .dependency-cruiser.js > /dev/null 2>&1; then
  echo "FAIL: Agent -> Agent was NOT caught"
else
  echo "PASS: Agent -> Agent was caught"
fi
rm -rf packages/agents/src/agent-a packages/agents/src/agent-b
