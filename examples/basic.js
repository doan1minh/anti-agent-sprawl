/**
 * Example: Basic Governor Usage
 * 
 * This example shows how to use the Anti-Agent-Sprawl pattern
 * for coordinating AI agents.
 */

const { Governor } = require('anti-agent-sprawl');
const path = require('path');

async function main() {
  // Create governor with custom paths
  const governor = new Governor({
    controlStatePath: path.join(__dirname, 'CONTROL_STATE.yaml'),
    decisionRulesPath: path.join(__dirname, 'DECISION_RULES.md'),
    maxRetries: 3,
    retryDelayMs: 5000,
    loopIntervalMs: 1000
  });
  
  // Register event handlers
  governor.onStateRead = async (state) => {
    console.log('[Event] State read:', JSON.stringify(state, null, 2));
  };
  
  governor.onRuleMatched = async (rule) => {
    console.log('[Event] Rule matched:', rule.name);
  };
  
  governor.onActionExecuted = async (rule, result) => {
    console.log('[Event] Action executed:', rule.action, 'Result:', result);
  };
  
  governor.onError = async (error) => {
    console.error('[Event] Error:', error.message);
  };
  
  // Handle shutdown
  process.on('SIGINT', () => {
    console.log('\n[Main] Shutting down...');
    governor.stop();
    process.exit(0);
  });
  
  // Run governor
  console.log('[Main] Starting governor...');
  await governor.run();
}

main().catch(console.error);