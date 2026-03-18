# Anti-Agent-Sprawl

> **Stop Agent Sprawl. Coordinate with Confidence.**

A stateful, rule-based, governor-controlled pattern for coordinating AI agents without chaos.

## The Problem

```
┌─────────────────────────────────────────────────┐
│           AGENT SPRAWL                           │
├─────────────────────────────────────────────────┤
│                                                 │
│  Agent 1 ──┐                                   │
│  Agent 2 ──┼──► Context Fragmentation          │
│  Agent 3 ──┤    Memory Explosion               │
│  Agent 4 ──┤    Coordination Overhead          │
│  Agent 5 ──┤    Inconsistent State            │
│  Agent 6 ──┘    Maintenance Burden             │
│                                                 │
│  Who coordinates the coordinators?              │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Our Solution

```
┌─────────────────────────────────────────────────┐
│         ANTI-AGENT-SPRAWL                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  CONTROL_STATE.yaml   →  State Coordination    │
│  ├── Single source of truth                    │
│  └── All state in ONE file                    │
│                                                 │
│  DECISION_RULES.md    →  Decision Logic         │
│  ├── All rules in ONE file                    │
│  └── Priority-based execution                │
│                                                 │
│  Governor              →  Execution Engine       │
│  ├── One coordinator                           │
│  └── No race conditions                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Installation

```bash
npm install anti-agent-sprawl
```

## Quick Start

```javascript
const { Governor } = require('anti-agent-sprawl');

// Create governor
const governor = new Governor({
  controlStatePath: './CONTROL_STATE.yaml',
  decisionRulesPath: './DECISION_RULES.md'
});

// Run governor
governor.run();
```

## How It Works

### 1. Define State (CONTROL_STATE.yaml)

```yaml
gate_1:
  status: PENDING
  last_processed: null

gate_2:
  status: PENDING
  last_processed: null

run_signal:
  requested: false
  request_id: null
```

### 2. Define Rules (DECISION_RULES.md)

```yaml
- name: "process_run_signal"
  condition: "state.run_signal.requested == true"
  action: "execute_step"
  priority: 1

- name: "continue_progression"
  condition: "state.gate_1.status == 'PASS'"
  action: "proceed_to_gate_2"
  priority: 2

- name: "handle_error"
  condition: "state.error == true"
  action: "halt_and_report"
  priority: 10
```

### 3. Governor Executes

```javascript
while (running) {
  // 1. Read state
  const state = await readControlState();
  
  // 2. Read rules
  const rules = await readDecisionRules();
  
  // 3. Find matching rule (highest priority)
  const rule = findMatchingRule(state, rules);
  
  // 4. Execute action
  await executeAction(rule.action);
  
  // 5. Update state
  await writeControlState();
}
```

## API

### Governor

```javascript
const governor = new Governor(options);
```

**Options:**
- `controlStatePath` - Path to CONTROL_STATE.yaml (default: `./CONTROL_STATE.yaml`)
- `decisionRulesPath` - Path to DECISION_RULES.md (default: `./DECISION_RULES.md`)
- `maxRetries` - Max retries on error (default: 3)
- `retryDelayMs` - Delay between retries (default: 5000)

**Methods:**
- `run()` - Start governor loop
- `stop()` - Stop governor loop
- `readControlState()` - Read current state
- `readDecisionRules()` - Read decision rules
- `findMatchingRule(state, rules)` - Find highest priority matching rule
- `executeAction(rule)` - Execute rule action
- `writeControlState()` - Write state back to file

## Why This Works

| Problem | Solution |
|---------|----------|
| Context fragmentation | Single CONTROL_STATE |
| Duplicate logic | Single DECISION_RULES |
| Coordination overhead | One governor |
| Race conditions | Sequential execution |
| Untraceable decisions | Rule-based logging |

## Use Cases

- **AI Agent Coordination** - Multiple agents, one coordinator
- **State Machine Execution** - Gate progression, step execution
- **Production Readiness Checks** - Deterministic progression
- **Workflow Orchestration** - Rule-based task execution
- **Any Multi-Step Process** - Stateful execution

## Comparison

| Approach | Anti-Sprawl? |
|----------|--------------|
| Multiple agents | ❌ No |
| Agent chains | ❌ No |
| AutoGPT loop | ⚠️ Partial |
| Multi-agent teams | ❌ No |
| **Our pattern** | ✅ Yes |

## Example: Production Readiness Gates

```yaml
# CONTROL_STATE.yaml
gate_1:
  status: PASS
  last_processed: "2024-01-15T10:00:00Z"

gate_2:
  status: IN_PROGRESS
  last_processed: "2024-01-15T10:05:00Z"

run_signal:
  requested: true
  request_id: "execute-gate-2"
```

```yaml
# DECISION_RULES.md
- name: "process_gate_2"
  condition: "state.gate_1.status == 'PASS' && state.run_signal.requested == true"
  action: "execute_gate_2"
  priority: 1
```

Governor reads state, matches rule, executes.

## Design Principles

1. **Stateful** - All state in ONE file
2. **Rule-Based** - All logic in ONE file
3. **Governor-Controlled** - One coordinator
4. **Deterministic** - Same input = same output
5. **Traceable** - All decisions logged
6. **Maintainable** - Change rules, not code

## License

MIT

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)

## Links

- [GitHub](https://github.com/openclaw/anti-agent-sprawl)
- [NPM](https://www.npmjs.com/package/anti-agent-sprawl)
- [Documentation](https://github.com/openclaw/anti-agent-sprawl#readme)

---

**Stop the sprawl. Start coordinating.**