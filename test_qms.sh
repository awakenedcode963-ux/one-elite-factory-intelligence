#!/bin/bash
set -u
cp packages/domain/src/index.ts packages/domain/src/index.ts.bak
echo "import { Something } from '../../../integrations/qms-adapter/src/index.js'; console.log(Something);" >> packages/domain/src/index.ts
if npx dependency-cruiser packages apps integrations --config .dependency-cruiser.js > /dev/null 2>&1; then
  echo "FAIL: Domain -> QMS was NOT caught"
else
  echo "PASS: Domain -> QMS was caught"
fi
mv packages/domain/src/index.ts.bak packages/domain/src/index.ts
