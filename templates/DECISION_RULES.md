# DECISION_RULES.md - Template

## Copy this file to your project and customize

## Rule Format
# - name: "rule_name"
#   condition: "state.field == value"
#   action: "what_to_do"
#   priority: N (optional, default 5)

---

# Priority Levels
# 1-2: Critical (signal processing, blocking defects)
# 3-4: High (memory consolidation, state updates)
# 5-6: Medium (routine processing)
# 7-8: Low (error recovery, completion)
# 9-10: Background (cleanup, optimization)

---

## RUN Signal Processing

- name: "process_run_signal"
  condition: "state.RUN_SIGNAL.requested == true"
  action: "read_signal_and_execute"
  priority: 1

- name: "clear_signal_after_processing"
  condition: "state.RUN_SIGNAL.requested == false && state.progress.last_step_completed == true"
  action: "clear_run_signal"
  priority: 6

## Gate Progression

- name: "continue_gate_progression"
  condition: "state.gate_1.status == 'PASS' && state.gate_2.status == 'PENDING'"
  action: "proceed_to_gate_2"
  priority: 2

## Blocking Defect Handling

- name: "handle_blocking_defect"
  condition: "state.progress.blocking_defects.length > 0"
  action: "halt_and_report"
  priority: 10

## State Update

- name: "update_state_after_step"
  condition: "state.progress.step_completed == true"
  action: "write_control_state"
  priority: 5

## Memory Consolidation

- name: "consolidate_memory"
  condition: "state.memory.significant_events.length >= state.memory.consolidation_threshold"
  action: "update_memory_file"
  priority: 3

## Error Recovery

- name: "recover_from_error"
  condition: "state.governor.state == 'ERROR' && state.governor.retry_count < 3"
  action: "retry_with_backoff"
  priority: 7

## Completion Check

- name: "check_completion"
  condition: "state.progress.completed_items == state.progress.total_items"
  action: "mark_production_ready"
  priority: 8

## Idle Check

- name: "idle_when_no_signal"
  condition: "state.RUN_SIGNAL.requested == false && state.governor.state == 'IDLE'"
  action: "wait_for_signal"
  priority: 9