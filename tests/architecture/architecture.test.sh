#!/bin/bash
set -e
echo "Running Architecture Tests (FI-13)"
echo "1. Checking Dependency Graph with dependency-cruiser..."
npx depcruise packages apps integrations --config .dependency-cruiser.js
echo "2. Validating TypeScript strict boundaries (excluding legacy src)..."
npx tsc --noEmit --project tsconfig.architecture.json
echo "Architecture Tests Passed."
