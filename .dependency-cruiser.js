export default {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true }
    },
    {
      name: 'contracts-zero-internal-dependencies',
      severity: 'error',
      from: { path: '^packages/contracts' },
      to: { path: '^(packages|apps|integrations)/(?!contracts)' }
    },
    {
      name: 'no-policy-to-domain',
      severity: 'error',
      from: { path: '^packages/policy' },
      to: { path: '^packages/domain' }
    },
    {
      name: 'no-policy-to-dal',
      severity: 'error',
      from: { path: '^packages/policy' },
      to: { path: '^packages/dal' }
    },
    {
      name: 'no-policy-to-adapters',
      severity: 'error',
      from: { path: '^packages/policy' },
      to: { path: '^packages/adapters' }
    },
    {
      name: 'no-domain-to-dal',
      severity: 'error',
      from: { path: '^packages/domain' },
      to: { path: '^packages/dal' }
    },
    {
      name: 'no-domain-to-orchestrator',
      severity: 'error',
      from: { path: '^packages/domain' },
      to: { path: '^packages/orchestrator' }
    },
    {
      name: 'no-domain-to-adapters',
      severity: 'error',
      from: { path: '^packages/domain' },
      to: { path: '^packages/adapters' }
    },
    {
      name: 'no-dal-to-domain',
      severity: 'error',
      from: { path: '^packages/dal' },
      to: { path: '^packages/domain' }
    },
    {
      name: 'no-dal-to-orchestrator',
      severity: 'error',
      from: { path: '^packages/dal' },
      to: { path: '^packages/orchestrator' }
    },
    {
      name: 'no-agents-to-domain',
      severity: 'error',      
      from: { path: '^packages/agents' },
      to: { path: '^packages/domain' }
    },
    {
      name: 'no-agents-to-dal',
      severity: 'error',
      from: { path: '^packages/agents' },
      to: { path: '^packages/dal' }
    },
    {
      name: 'no-agents-to-orchestrator',
      severity: 'error',
      from: { path: '^packages/agents' },
      to: { path: '^packages/orchestrator' }
    },
    {
      name: 'no-agent-to-agent',
      severity: 'error',
      from: { path: '^packages/agents/src/(?!index\\.ts)([^/]+)' },
      to: { path: '^packages/agents/src/(?!index\\.ts)([^/]+)', pathNot: '^packages/agents/src/$1' }
    },
    {
      name: 'no-runtime-to-domain',
      severity: 'error',
      from: { path: '^packages/agent-runtime' },
      to: { path: '^packages/domain' }
    },
    {
      name: 'no-runtime-to-dal',
      severity: 'error',
      from: { path: '^packages/agent-runtime' },
      to: { path: '^packages/dal' }
    },
    {
      name: 'no-runtime-to-adapters',
      severity: 'error',
      from: { path: '^packages/agent-runtime' },
      to: { path: '^packages/adapters' }
    },
    {
      name: 'no-orchestrator-to-dal',
      severity: 'error',
      from: { path: '^packages/orchestrator' },
      to: { path: '^packages/dal' }
    },
    {
      name: 'no-orchestrator-to-adapters',
      severity: 'error',
      from: { path: '^packages/orchestrator' },
      to: { path: '^packages/adapters' }
    },
    {
      name: 'no-tools-to-dal',
      severity: 'error',
      from: { path: '^packages/tools' },
      to: { path: '^packages/dal' }
    },
    {
      name: 'no-tools-to-adapters',
      severity: 'error',
      from: { path: '^packages/tools' },
      to: { path: '^packages/adapters' }
    },
    {
      name: 'no-api-to-dal',
      severity: 'error',
      from: { path: '^apps/fi-api' },
      to: { path: '^packages/dal' }
    },
    {
      name: 'no-api-to-adapters',
      severity: 'error',
      from: { path: '^apps/fi-api' },
      to: { path: '^packages/adapters' }
    },
    {
      name: 'no-qms-to-domain',
      severity: 'error',
      from: { path: '^integrations/qms-adapter' },
      to: { path: '^packages/domain' }
    },
    {
      name: 'no-qms-to-dal',
      severity: 'error',
      from: { path: '^integrations/qms-adapter' },
      to: { path: '^packages/dal' }
    },
    {
      name: 'no-qms-to-orchestrator',
      severity: 'error',
      from: { path: '^integrations/qms-adapter' },
      to: { path: '^packages/orchestrator' }
    },
    {
      name: 'no-core-to-qms',
      severity: 'error',
      from: { path: '^(packages|apps)/' },
      to: { path: '^integrations/qms-adapter/' }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules'
    },
    tsConfig: {
      fileName: 'tsconfig.architecture.json'
    }
  }
};
