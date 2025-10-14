/**
 * MessageHistory Pattern
 *
 * Tracks the complete journey of a message through the system:
 * - Records all processing steps and transformations
 * - Maintains audit trail for debugging and compliance
 * - Enables message replay and analysis
 * - Supports distributed tracing
 * - Provides visibility into message flow
 *
 * Use cases:
 * - Debugging message processing issues
 * - Compliance and audit requirements
 * - Performance analysis
 * - Message flow visualization
 * - Root cause analysis
 */

const crypto = require('crypto');
const { EventEmitter } = require('events');

class MessageHistory extends EventEmitter {
  constructor(config = {}) {
    super();

    this.histories = new Map();
    this.maxHistorySize = config.maxHistorySize || 10000;
    this.retentionPeriod = config.retentionPeriod || 86400000; // 24 hours
    this.compressionEnabled = config.compressionEnabled || false;
    this.persistenceEnabled = config.persistenceEnabled || false;
    this.persistenceHandler = config.persistenceHandler || null;
    this.trackingEnabled = config.trackingEnabled !== false;
    this.metricsEnabled = config.metricsEnabled !== false;

    // Metrics
    this.metrics = {
      totalMessages: 0,
      totalSteps: 0,
      averageStepsPerMessage: 0,
      longestPath: 0,
      shortestPath: Infinity,
      averageProcessingTime: 0,
      processingTimes: []
    };

    // Processing steps tracking
    this.stepTypes = new Map();
    this.stepDurations = new Map();

    // Search indexes
    this.messagesByCorrelationId = new Map();
    this.messagesByType = new Map();
    this.messagesByTimestamp = [];

    // Cleanup interval
    this.cleanupInterval = config.cleanupInterval || 3600000; // 1 hour
    this.startCleanupScheduler();
  }

  /**
   * Start tracking a new message
   */
  startTracking(message, metadata = {}) {
    if (!this.trackingEnabled) {
      return null;
    }

    if (!message || !message.id) {
      throw new Error('Message must have an id property');
    }

    const historyId = message.id;
    const history = {
      id: historyId,
      messageId: message.id,
      messageType: message.type || 'unknown',
      correlationId: message.correlationId || this.generateCorrelationId(),
      startTime: Date.now(),
      endTime: null,
      status: 'in-progress',
      steps: [],
      metadata: {
        ...metadata,
        originalMessage: this.compressionEnabled
          ? this.compressMessage(message)
          : message
      },
      errors: [],
      warnings: []
    };

    this.histories.set(historyId, history);

    // Update indexes
    if (history.correlationId) {
      if (!this.messagesByCorrelationId.has(history.correlationId)) {
        this.messagesByCorrelationId.set(history.correlationId, []);
      }
      this.messagesByCorrelationId.get(history.correlationId).push(historyId);
    }

    if (!this.messagesByType.has(history.messageType)) {
      this.messagesByType.set(history.messageType, []);
    }
    this.messagesByType.get(history.messageType).push(historyId);

    this.messagesByTimestamp.push({
      historyId,
      timestamp: history.startTime
    });

    this.metrics.totalMessages++;

    this.emit('trackingStarted', { historyId, message });

    return historyId;
  }

  /**
   * Add a processing step to message history
   */
  addStep(messageId, stepData) {
    const history = this.histories.get(messageId);
    if (!history) {
      throw new Error(`No history found for message: ${messageId}`);
    }

    const step = {
      id: this.generateStepId(),
      timestamp: Date.now(),
      type: stepData.type || 'processing',
      component: stepData.component || 'unknown',
      action: stepData.action || 'process',
      duration: stepData.duration || null,
      input: stepData.input || null,
      output: stepData.output || null,
      metadata: stepData.metadata || {},
      error: stepData.error || null,
      warning: stepData.warning || null
    };

    history.steps.push(step);
    this.metrics.totalSteps++;

    // Track step types
    if (!this.stepTypes.has(step.type)) {
      this.stepTypes.set(step.type, 0);
    }
    this.stepTypes.set(step.type, this.stepTypes.get(step.type) + 1);

    // Track step durations
    if (step.duration !== null) {
      if (!this.stepDurations.has(step.type)) {
        this.stepDurations.set(step.type, []);
      }
      this.stepDurations.get(step.type).push(step.duration);
    }

    // Track errors and warnings
    if (step.error) {
      history.errors.push({
        stepId: step.id,
        timestamp: step.timestamp,
        error: step.error
      });
    }

    if (step.warning) {
      history.warnings.push({
        stepId: step.id,
        timestamp: step.timestamp,
        warning: step.warning
      });
    }

    this.emit('stepAdded', { historyId: messageId, step });

    // Persist if enabled
    if (this.persistenceEnabled && this.persistenceHandler) {
      this.persistHistory(history);
    }

    return step.id;
  }

  /**
   * Complete message tracking
   */
  completeTracking(messageId, status = 'completed', metadata = {}) {
    const history = this.histories.get(messageId);
    if (!history) {
      throw new Error(`No history found for message: ${messageId}`);
    }

    history.endTime = Date.now();
    history.status = status;
    history.totalDuration = history.endTime - history.startTime;
    history.metadata = {
      ...history.metadata,
      ...metadata
    };

    // Update metrics
    this.updateMetrics(history);

    this.emit('trackingCompleted', { historyId: messageId, history });

    // Persist if enabled
    if (this.persistenceEnabled && this.persistenceHandler) {
      this.persistHistory(history);
    }

    return history;
  }

  /**
   * Get history for a message
   */
  getHistory(messageId) {
    return this.histories.get(messageId) || null;
  }

  /**
   * Get all histories
   */
  getAllHistories(filter = null) {
    const histories = Array.from(this.histories.values());

    if (!filter) {
      return histories;
    }

    return histories.filter(filter);
  }

  /**
   * Get histories by correlation ID
   */
  getHistoriesByCorrelationId(correlationId) {
    const historyIds = this.messagesByCorrelationId.get(correlationId) || [];
    return historyIds
      .map(id => this.histories.get(id))
      .filter(h => h !== undefined);
  }

  /**
   * Get histories by message type
   */
  getHistoriesByType(messageType) {
    const historyIds = this.messagesByType.get(messageType) || [];
    return historyIds
      .map(id => this.histories.get(id))
      .filter(h => h !== undefined);
  }

  /**
   * Get histories within time range
   */
  getHistoriesByTimeRange(startTime, endTime) {
    return this.messagesByTimestamp
      .filter(entry => entry.timestamp >= startTime && entry.timestamp <= endTime)
      .map(entry => this.histories.get(entry.historyId))
      .filter(h => h !== undefined);
  }

  /**
   * Search histories by criteria
   */
  searchHistories(criteria) {
    return Array.from(this.histories.values()).filter(history => {
      let matches = true;

      if (criteria.messageType && history.messageType !== criteria.messageType) {
        matches = false;
      }

      if (criteria.correlationId && history.correlationId !== criteria.correlationId) {
        matches = false;
      }

      if (criteria.status && history.status !== criteria.status) {
        matches = false;
      }

      if (criteria.hasErrors !== undefined) {
        if (criteria.hasErrors && history.errors.length === 0) {
          matches = false;
        }
        if (!criteria.hasErrors && history.errors.length > 0) {
          matches = false;
        }
      }

      if (criteria.minDuration && history.totalDuration < criteria.minDuration) {
        matches = false;
      }

      if (criteria.maxDuration && history.totalDuration > criteria.maxDuration) {
        matches = false;
      }

      if (criteria.component) {
        const hasComponent = history.steps.some(s => s.component === criteria.component);
        if (!hasComponent) {
          matches = false;
        }
      }

      return matches;
    });
  }

  /**
   * Get message path (list of components visited)
   */
  getMessagePath(messageId) {
    const history = this.histories.get(messageId);
    if (!history) {
      return null;
    }

    return history.steps.map(step => ({
      component: step.component,
      action: step.action,
      timestamp: step.timestamp,
      duration: step.duration
    }));
  }

  /**
   * Analyze message flow
   */
  analyzeFlow(messageId) {
    const history = this.histories.get(messageId);
    if (!history) {
      return null;
    }

    const analysis = {
      messageId,
      totalDuration: history.totalDuration,
      totalSteps: history.steps.length,
      status: history.status,
      errorCount: history.errors.length,
      warningCount: history.warnings.length,
      components: new Set(history.steps.map(s => s.component)),
      stepTypes: new Map(),
      bottlenecks: [],
      averageStepDuration: 0
    };

    // Analyze step types
    for (const step of history.steps) {
      if (!analysis.stepTypes.has(step.type)) {
        analysis.stepTypes.set(step.type, 0);
      }
      analysis.stepTypes.set(step.type, analysis.stepTypes.get(step.type) + 1);
    }

    // Calculate average step duration
    const durationsWithValue = history.steps.filter(s => s.duration !== null);
    if (durationsWithValue.length > 0) {
      const sum = durationsWithValue.reduce((acc, s) => acc + s.duration, 0);
      analysis.averageStepDuration = sum / durationsWithValue.length;
    }

    // Identify bottlenecks (steps taking > 2x average)
    if (analysis.averageStepDuration > 0) {
      const threshold = analysis.averageStepDuration * 2;
      analysis.bottlenecks = history.steps
        .filter(s => s.duration !== null && s.duration > threshold)
        .map(s => ({
          stepId: s.id,
          component: s.component,
          action: s.action,
          duration: s.duration,
          slowdownFactor: s.duration / analysis.averageStepDuration
        }))
        .sort((a, b) => b.duration - a.duration);
    }

    // Convert Set to Array for JSON serialization
    analysis.components = Array.from(analysis.components);
    analysis.stepTypes = Object.fromEntries(analysis.stepTypes);

    return analysis;
  }

  /**
   * Generate visual representation of message path
   */
  visualizePath(messageId) {
    const history = this.histories.get(messageId);
    if (!history) {
      return null;
    }

    let visualization = `\nMessage Path for ${messageId}\n`;
    visualization += `Status: ${history.status}\n`;
    visualization += `Duration: ${history.totalDuration}ms\n`;
    visualization += `Steps: ${history.steps.length}\n`;
    visualization += '\n';

    for (let i = 0; i < history.steps.length; i++) {
      const step = history.steps[i];
      const isLast = i === history.steps.length - 1;

      const prefix = isLast ? '└─' : '├─';
      const duration = step.duration !== null ? ` (${step.duration}ms)` : '';
      const error = step.error ? ' [ERROR]' : '';
      const warning = step.warning ? ' [WARNING]' : '';

      visualization += `${prefix} ${step.component} - ${step.action}${duration}${error}${warning}\n`;

      if (!isLast) {
        visualization += '│\n';
      }
    }

    return visualization;
  }

  /**
   * Update metrics based on completed history
   */
  updateMetrics(history) {
    if (!this.metricsEnabled) {
      return;
    }

    const stepCount = history.steps.length;

    // Update path length metrics
    if (stepCount > this.metrics.longestPath) {
      this.metrics.longestPath = stepCount;
    }
    if (stepCount < this.metrics.shortestPath) {
      this.metrics.shortestPath = stepCount;
    }

    // Update average steps per message
    this.metrics.averageStepsPerMessage =
      this.metrics.totalSteps / this.metrics.totalMessages;

    // Update processing time metrics
    if (history.totalDuration) {
      this.metrics.processingTimes.push(history.totalDuration);

      // Keep only last 1000 processing times
      if (this.metrics.processingTimes.length > 1000) {
        this.metrics.processingTimes = this.metrics.processingTimes.slice(-1000);
      }

      // Calculate average
      const sum = this.metrics.processingTimes.reduce((a, b) => a + b, 0);
      this.metrics.averageProcessingTime =
        sum / this.metrics.processingTimes.length;
    }
  }

  /**
   * Get comprehensive metrics
   */
  getMetrics() {
    const stepTypeStats = {};
    for (const [type, count] of this.stepTypes.entries()) {
      stepTypeStats[type] = {
        count,
        percentage: (count / this.metrics.totalSteps) * 100
      };
    }

    const stepDurationStats = {};
    for (const [type, durations] of this.stepDurations.entries()) {
      const sum = durations.reduce((a, b) => a + b, 0);
      stepDurationStats[type] = {
        count: durations.length,
        average: sum / durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations)
      };
    }

    return {
      ...this.metrics,
      totalHistories: this.histories.size,
      inProgress: Array.from(this.histories.values()).filter(
        h => h.status === 'in-progress'
      ).length,
      completed: Array.from(this.histories.values()).filter(
        h => h.status === 'completed'
      ).length,
      failed: Array.from(this.histories.values()).filter(
        h => h.status === 'failed'
      ).length,
      stepTypeStats,
      stepDurationStats
    };
  }

  /**
   * Compress message data for storage
   */
  compressMessage(message) {
    return {
      id: message.id,
      type: message.type,
      timestamp: message.timestamp,
      size: JSON.stringify(message).length
    };
  }

  /**
   * Persist history to storage
   */
  async persistHistory(history) {
    if (!this.persistenceHandler) {
      return;
    }

    try {
      await this.persistenceHandler(history);
      this.emit('historyPersisted', { historyId: history.id });
    } catch (error) {
      this.emit('persistenceError', { historyId: history.id, error });
    }
  }

  /**
   * Clean up old histories
   */
  cleanup() {
    const now = Date.now();
    const cutoff = now - this.retentionPeriod;
    let cleaned = 0;

    for (const [id, history] of this.histories.entries()) {
      if (history.startTime < cutoff && history.status !== 'in-progress') {
        this.histories.delete(id);

        // Clean up indexes
        if (history.correlationId) {
          const correlationIds = this.messagesByCorrelationId.get(history.correlationId);
          if (correlationIds) {
            const index = correlationIds.indexOf(id);
            if (index !== -1) {
              correlationIds.splice(index, 1);
            }
          }
        }

        const typeIds = this.messagesByType.get(history.messageType);
        if (typeIds) {
          const index = typeIds.indexOf(id);
          if (index !== -1) {
            typeIds.splice(index, 1);
          }
        }

        cleaned++;
      }
    }

    // Clean up timestamp index
    this.messagesByTimestamp = this.messagesByTimestamp.filter(
      entry => entry.timestamp >= cutoff
    );

    if (cleaned > 0) {
      this.emit('cleaned', { count: cleaned });
    }

    return cleaned;
  }

  /**
   * Start cleanup scheduler
   */
  startCleanupScheduler() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  /**
   * Stop cleanup scheduler
   */
  stopCleanupScheduler() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Generate correlation ID
   */
  generateCorrelationId() {
    return `corr_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Generate step ID
   */
  generateStepId() {
    return `step_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Clear all histories
   */
  clear() {
    this.histories.clear();
    this.messagesByCorrelationId.clear();
    this.messagesByType.clear();
    this.messagesByTimestamp = [];
    this.stepTypes.clear();
    this.stepDurations.clear();
  }

  /**
   * Reset all state
   */
  reset() {
    this.clear();
    this.metrics = {
      totalMessages: 0,
      totalSteps: 0,
      averageStepsPerMessage: 0,
      longestPath: 0,
      shortestPath: Infinity,
      averageProcessingTime: 0,
      processingTimes: []
    };
    this.emit('reset');
  }

  /**
   * Cleanup on destroy
   */
  destroy() {
    this.stopCleanupScheduler();
    this.clear();
    this.removeAllListeners();
  }
}

module.exports = MessageHistory;
