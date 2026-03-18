#!/usr/bin/env node

/**
 * Governor - Anti-Agent-Sprawl Coordinator
 * 
 * Pattern: Stateful + Rule-Based + Governor-Controlled
 * 
 * This module coordinates agent execution by:
 * 1. Reading state from CONTROL_STATE.yaml
 * 2. Reading decision rules from DECISION_RULES.md
 * 3. Finding matching rule (highest priority first)
 * 4. Executing the action
 * 5. Updating state
 * 
 * This prevents agent sprawl by centralizing:
 * - State in ONE file (CONTROL_STATE.yaml)
 * - Rules in ONE file (DECISION_RULES.md)
 * - Execution by ONE governor
 * 
 * @module anti-agent-sprawl
 * @version 1.0.0
 * @license MIT
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Governor - Main coordinator class
 * 
 * @class Governor
 * @example
 * const governor = new Governor();
 * governor.run();
 */
class Governor {
  /**
   * Create a Governor instance
   * @param {Object} options - Configuration options
   * @param {string} [options.controlStatePath='./CONTROL_STATE.yaml'] - Path to state file
   * @param {string} [options.decisionRulesPath='./DECISION_RULES.md'] - Path to rules file
   * @param {number} [options.maxRetries=3] - Maximum retry attempts
   * @param {number} [options.retryDelayMs=5000] - Delay between retries
   * @param {number} [options.loopIntervalMs=1000] - Interval between iterations
   */
  constructor(options = {}) {
    this.controlStatePath = options.controlStatePath || './CONTROL_STATE.yaml';
    this.decisionRulesPath = options.decisionRulesPath || './DECISION_RULES.md';
    this.maxRetries = options.maxRetries || 3;
    this.retryDelayMs = options.retryDelayMs || 5000;
    this.loopIntervalMs = options.loopIntervalMs || 1000;
    
    this.state = {};
    this.rules = [];
    this.running = false;
    this.retryCount = 0;
    this.iterationCount = 0;
    this.startTime = null;
    
    // Event handlers
    this.onStateRead = null;
    this.onRuleMatched = null;
    this.onActionExecuted = null;
    this.onStateUpdated = null;
    this.onError = null;
  }

  /**
   * Read CONTROL_STATE.yaml
   * @returns {Promise<Object>} Current state
   */
  async readControlState() {
    try {
      const content = fs.readFileSync(this.controlStatePath, 'utf8');
      this.state = yaml.load(content);
      
      if (this.onStateRead) {
        await this.onStateRead(this.state);
      }
      
      return this.state;
    } catch (error) {
      console.error('[Governor] Error reading CONTROL_STATE:', error.message);
      
      if (this.onError) {
        await this.onError(error);
      }
      
      return {};
    }
  }

  /**
   * Read DECISION_RULES.md
   * @returns {Promise<Array>} Decision rules
   */
  async readDecisionRules() {
    try {
      const content = fs.readFileSync(this.decisionRulesPath, 'utf8');
      this.rules = this.parseRules(content);
      return this.rules;
    } catch (error) {
      console.error('[Governor] Error reading DECISION_RULES:', error.message);
      
      if (this.onError) {
        await this.onError(error);
      }
      
      return [];
    }
  }

  /**
   * Parse rules from DECISION_RULES.md
   * @param {string} content - Markdown content
   * @returns {Array} Parsed rules
   */
  parseRules(content) {
    const rules = [];
    
    // Match YAML-like rule blocks
    const ruleRegex = /- name: "([^"]+)"\s+condition: "([^"]+)"\s+action: "([^"]+)"(?:\s+priority: (\d+))?(?:\s+tags: \[([^\]]+)\])?/g;
    
    let match;
    while ((match = ruleRegex.exec(content)) !== null) {
      rules.push({
        name: match[1],
        condition: match[2],
        action: match[3],
        priority: parseInt(match[4] || '5', 10),
        tags: match[5] ? match[5].split(',').map(t => t.trim().replace(/"/g, '')) : []
      });
    }
    
    return rules;
  }

  /**
   * Evaluate condition against state
   * @param {string} condition - Condition expression
   * @param {Object} state - Current state
   * @returns {boolean} Whether condition matches
   */
  evaluateCondition(condition, state) {
    try {
      // Create safe evaluation context
      const evalString = `
        const state = ${JSON.stringify(state)};
        return (${condition});
      `;
      
      const fn = new Function(evalString);
      return fn();
    } catch (error) {
      console.error('[Governor] Condition evaluation error:', error.message);
      return false;
    }
  }

  /**
   * Find matching rule (highest priority first)
   * @param {Object} state - Current state
   * @param {Array} rules - Available rules
   * @returns {Object|null} Matching rule or null
   */
  findMatchingRule(state, rules) {
    const matching = rules.filter(r => this.evaluateCondition(r.condition, state));
    
    if (matching.length === 0) {
      return null;
    }
    
    // Sort by priority (highest first)
    matching.sort((a, b) => b.priority - a.priority);
    
    return matching[0];
  }

  /**
   * Execute action for a rule
   * @param {Object} rule - Rule to execute
   * @returns {Promise<boolean>} Success status
   */
  async executeAction(rule) {
    console.log(`[Governor] Executing: ${rule.name} (priority: ${rule.priority})`);
    
    if (this.onRuleMatched) {
      await this.onRuleMatched(rule);
    }
    
    // Built-in actions
    const actions = {
      'read_signal_and_execute': () => this.processRunSignal(),
      'proceed_to_next_gate': () => this.continueGateProgression(),
      'halt_and_report': () => this.haltAndReport(),
      'write_control_state': () => this.writeControlState(),
      'clear_run_signal': () => this.clearRunSignal(),
      'update_memory_file': () => this.updateMemoryFile()
    };
    
    if (actions[rule.action]) {
      const result = await actions[rule.action]();
      
      if (this.onActionExecuted) {
        await this.onActionExecuted(rule, result);
      }
      
      return result;
    }
    
    // Custom action - emit event or call handler
    console.log(`[Governor] Unknown action: ${rule.action}`);
    return false;
  }

  /**
   * Process RUN_SIGNAL
   */
  async processRunSignal() {
    if (this.state.RUN_SIGNAL?.requested) {
      console.log('[Governor] Processing RUN_SIGNAL...');
      // Implementation depends on project
      return true;
    }
    return false;
  }

  /**
   * Continue gate progression
   */
  async continueGateProgression() {
    console.log('[Governor] Continuing gate progression...');
    // Implementation depends on project
    return true;
  }

  /**
   * Halt and report
   */
  async haltAndReport() {
    console.log('[Governor] Halting due to blocking condition...');
    this.running = false;
    return true;
  }

  /**
   * Write CONTROL_STATE
   */
  async writeControlState() {
    try {
      const content = yaml.dump(this.state, { indent: 2, lineWidth: -1 });
      fs.writeFileSync(this.controlStatePath, content, 'utf8');
      console.log('[Governor] State updated');
      
      if (this.onStateUpdated) {
        await this.onStateUpdated(this.state);
      }
      
      return true;
    } catch (error) {
      console.error('[Governor] Error writing state:', error.message);
      return false;
    }
  }

  /**
   * Clear RUN_SIGNAL
   */
  async clearRunSignal() {
    if (this.state.RUN_SIGNAL) {
      this.state.RUN_SIGNAL.requested = false;
      await this.writeControlState();
    }
    return true;
  }

  /**
   * Update memory file
   */
  async updateMemoryFile() {
    console.log('[Governor] Updating memory...');
    // Memory management logic
    return true;
  }

  /**
   * Main governor loop
   * @returns {Promise<void>}
   */
  async run() {
    console.log('[Governor] Starting anti-agent-sprawl governor...');
    console.log(`[Governor] CONTROL_STATE: ${this.controlStatePath}`);
    console.log(`[Governor] DECISION_RULES: ${this.decisionRulesPath}`);
    
    this.running = true;
    this.startTime = new Date();
    
    while (this.running) {
      try {
        // 1. Read current state
        await this.readControlState();
        
        // 2. Read decision rules
        await this.readDecisionRules();
        
        // 3. Find matching rule
        const rule = this.findMatchingRule(this.state, this.rules);
        
        // 4. Execute action
        if (rule) {
          await this.executeAction(rule);
          this.retryCount = 0;
        } else {
          // No matching rule - idle
        }
        
        // 5. Update state
        await this.writeControlState();
        
        // 6. Increment iteration
        this.iterationCount++;
        
        // 7. Wait before next iteration
        await this.wait(this.loopIntervalMs);
        
      } catch (error) {
        console.error('[Governor] Error in loop:', error.message);
        
        if (this.onError) {
          await this.onError(error);
        }
        
        this.retryCount++;
        
        if (this.retryCount >= this.maxRetries) {
          console.error('[Governor] Max retries reached, stopping...');
          this.running = false;
        } else {
          await this.wait(this.retryDelayMs);
        }
      }
    }
    
    console.log('[Governor] Stopped after', this.iterationCount, 'iterations');
  }

  /**
   * Wait helper
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise<void>}
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Stop governor
   */
  stop() {
    this.running = false;
    console.log('[Governor] Stopping...');
  }

  /**
   * Get status
   * @returns {Object} Governor status
   */
  getStatus() {
    return {
      running: this.running,
      iterations: this.iterationCount,
      startTime: this.startTime,
      uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
      retryCount: this.retryCount,
      currentRule: this.state.current_rule || null
    };
  }
}

// Export
module.exports = {
  Governor
};

// CLI entry point
if (require.main === module) {
  const governor = new Governor();
  
  // Handle shutdown
  process.on('SIGINT', () => {
    governor.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    governor.stop();
    process.exit(0);
  });
  
  // Run governor
  governor.run().catch(console.error);
}