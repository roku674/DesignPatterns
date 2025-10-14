/**
 * MessageJournal Pattern
 *
 * Provides durable message storage and replay capabilities:
 * - Persistent message logging
 * - Message replay for recovery
 * - Event sourcing support
 * - Audit trail maintenance
 * - Time-based message retrieval
 * - Disaster recovery
 *
 * Use cases:
 * - Event sourcing systems
 * - Audit and compliance
 * - System recovery after failures
 * - Message replay for testing
 * - Historical data analysis
 */

const crypto = require('crypto');
const { EventEmitter } = require('events');

class MessageJournal extends EventEmitter {
  constructor(config = {}) {
    super();

    this.journal = [];
    this.indexByType = new Map();
    this.indexByCorrelationId = new Map();
    this.indexByTimestamp = [];
    this.maxJournalSize = config.maxJournalSize || 100000;
    this.persistenceEnabled = config.persistenceEnabled !== false;
    this.persistenceHandler = config.persistenceHandler || null;
    this.compressionEnabled = config.compressionEnabled || false;
    this.encryptionEnabled = config.encryptionEnabled || false;
    this.encryptionKey = config.encryptionKey || null;
    this.replayEnabled = config.replayEnabled !== false;
    this.snapshotInterval = config.snapshotInterval || 1000;
    this.retentionDays = config.retentionDays || 90;

    // Metrics
    this.metrics = {
      totalMessages: 0,
      totalReplays: 0,
      totalSnapshots: 0,
      journalSize: 0,
      oldestEntry: null,
      newestEntry: null,
      messagesByType: {},
      averageMessageSize: 0
    };

    // Snapshots
    this.snapshots = [];
    this.maxSnapshots = config.maxSnapshots || 10;
    this.lastSnapshotPosition = 0;

    // Replay state
    this.replayCallbacks = [];
    this.replayInProgress = false;

    // Archival
    this.archivalEnabled = config.archivalEnabled || false;
    this.archivalHandler = config.archivalHandler || null;
    this.archivedCount = 0;
  }

  /**
   * Append a message to the journal
   */
  async append(message, metadata = {}) {
    if (!message || !message.id) {
      throw new Error('Message must have an id property');
    }

    const entry = {
      sequence: this.journal.length,
      id: this.generateEntryId(),
      messageId: message.id,
      messageType: message.type || 'unknown',
      correlationId: message.correlationId || null,
      timestamp: Date.now(),
      message: this.encryptionEnabled
        ? this.encrypt(message)
        : this.compressionEnabled
        ? this.compress(message)
        : message,
      metadata: {
        ...metadata,
        encrypted: this.encryptionEnabled,
        compressed: this.compressionEnabled,
        size: JSON.stringify(message).length
      },
      persisted: false
    };

    // Add to journal
    this.journal.push(entry);

    // Update indexes
    this.updateIndexes(entry);

    // Update metrics
    this.updateMetrics(entry);

    // Persist if enabled
    if (this.persistenceEnabled && this.persistenceHandler) {
      try {
        await this.persistenceHandler(entry);
        entry.persisted = true;
        this.emit('entryPersisted', { entryId: entry.id });
      } catch (error) {
        this.emit('persistenceError', { entryId: entry.id, error });
      }
    }

    // Check if snapshot is needed
    if (this.journal.length - this.lastSnapshotPosition >= this.snapshotInterval) {
      await this.createSnapshot();
    }

    // Check journal size limit
    if (this.journal.length > this.maxJournalSize) {
      await this.archiveOldEntries();
    }

    this.emit('messageAppended', { entry });

    return entry.sequence;
  }

  /**
   * Retrieve messages from journal
   */
  retrieve(criteria = {}) {
    let entries = [...this.journal];

    // Filter by type
    if (criteria.type) {
      const typeIndexes = this.indexByType.get(criteria.type) || [];
      entries = typeIndexes.map(seq => this.journal[seq]).filter(e => e);
    }

    // Filter by correlation ID
    if (criteria.correlationId) {
      const corrIndexes = this.indexByCorrelationId.get(criteria.correlationId) || [];
      entries = corrIndexes.map(seq => this.journal[seq]).filter(e => e);
    }

    // Filter by time range
    if (criteria.startTime || criteria.endTime) {
      entries = entries.filter(entry => {
        if (criteria.startTime && entry.timestamp < criteria.startTime) {
          return false;
        }
        if (criteria.endTime && entry.timestamp > criteria.endTime) {
          return false;
        }
        return true;
      });
    }

    // Filter by sequence range
    if (criteria.startSequence !== undefined || criteria.endSequence !== undefined) {
      entries = entries.filter(entry => {
        if (criteria.startSequence !== undefined && entry.sequence < criteria.startSequence) {
          return false;
        }
        if (criteria.endSequence !== undefined && entry.sequence > criteria.endSequence) {
          return false;
        }
        return true;
      });
    }

    // Limit results
    if (criteria.limit) {
      entries = entries.slice(0, criteria.limit);
    }

    // Decrypt/decompress messages if needed
    return entries.map(entry => ({
      ...entry,
      message: this.decodeMessage(entry)
    }));
  }

  /**
   * Replay messages from journal
   */
  async replay(options = {}) {
    if (this.replayInProgress) {
      throw new Error('Replay already in progress');
    }

    if (!this.replayEnabled) {
      throw new Error('Replay is disabled');
    }

    this.replayInProgress = true;
    this.metrics.totalReplays++;

    const startSequence = options.startSequence || 0;
    const endSequence = options.endSequence || this.journal.length - 1;
    const batchSize = options.batchSize || 100;
    const delayBetweenBatches = options.delayBetweenBatches || 0;

    const replayStats = {
      startTime: Date.now(),
      endTime: null,
      messagesReplayed: 0,
      batchesProcessed: 0,
      errors: []
    };

    try {
      for (let i = startSequence; i <= endSequence; i += batchSize) {
        const batch = this.journal.slice(i, Math.min(i + batchSize, endSequence + 1));

        for (const entry of batch) {
          if (!entry) continue;

          try {
            const message = this.decodeMessage(entry);

            // Call all replay callbacks
            for (const callback of this.replayCallbacks) {
              await callback(message, entry);
            }

            replayStats.messagesReplayed++;

            this.emit('messageReplayed', { entry, message });

          } catch (error) {
            replayStats.errors.push({
              sequence: entry.sequence,
              error: error.message
            });
            this.emit('replayError', { entry, error });

            if (options.stopOnError) {
              throw error;
            }
          }
        }

        replayStats.batchesProcessed++;

        if (delayBetweenBatches > 0 && i + batchSize <= endSequence) {
          await this.delay(delayBetweenBatches);
        }
      }

      replayStats.endTime = Date.now();
      replayStats.duration = replayStats.endTime - replayStats.startTime;

      this.emit('replayCompleted', { stats: replayStats });

      return replayStats;

    } finally {
      this.replayInProgress = false;
    }
  }

  /**
   * Register a replay callback
   */
  onReplay(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    this.replayCallbacks.push(callback);

    return () => {
      const index = this.replayCallbacks.indexOf(callback);
      if (index !== -1) {
        this.replayCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Create a snapshot of current state
   */
  async createSnapshot() {
    const snapshot = {
      id: this.generateSnapshotId(),
      sequence: this.journal.length - 1,
      timestamp: Date.now(),
      journalSize: this.journal.length,
      metrics: { ...this.metrics }
    };

    this.snapshots.push(snapshot);
    this.lastSnapshotPosition = this.journal.length;

    // Keep only recent snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(-this.maxSnapshots);
    }

    this.metrics.totalSnapshots++;

    this.emit('snapshotCreated', { snapshot });

    return snapshot;
  }

  /**
   * Restore from snapshot
   */
  async restoreFromSnapshot(snapshotId) {
    const snapshot = this.snapshots.find(s => s.id === snapshotId);

    if (!snapshot) {
      throw new Error(`Snapshot not found: ${snapshotId}`);
    }

    // Truncate journal to snapshot sequence
    this.journal = this.journal.slice(0, snapshot.sequence + 1);

    // Rebuild indexes
    this.rebuildIndexes();

    this.emit('snapshotRestored', { snapshot });

    return snapshot;
  }

  /**
   * Archive old entries
   */
  async archiveOldEntries() {
    if (!this.archivalEnabled || !this.archivalHandler) {
      return 0;
    }

    const cutoffDate = Date.now() - (this.retentionDays * 24 * 60 * 60 * 1000);
    const toArchive = [];

    let archiveIndex = 0;
    for (let i = 0; i < this.journal.length; i++) {
      const entry = this.journal[i];
      if (entry && entry.timestamp < cutoffDate) {
        toArchive.push(entry);
        archiveIndex = i;
      } else {
        break;
      }
    }

    if (toArchive.length === 0) {
      return 0;
    }

    try {
      await this.archivalHandler(toArchive);

      // Remove archived entries
      this.journal = this.journal.slice(archiveIndex + 1);

      // Adjust sequence numbers
      for (let i = 0; i < this.journal.length; i++) {
        this.journal[i].sequence = i;
      }

      // Rebuild indexes
      this.rebuildIndexes();

      this.archivedCount += toArchive.length;

      this.emit('entriesArchived', { count: toArchive.length });

      return toArchive.length;

    } catch (error) {
      this.emit('archivalError', { error, count: toArchive.length });
      throw error;
    }
  }

  /**
   * Update indexes for new entry
   */
  updateIndexes(entry) {
    // Index by type
    if (!this.indexByType.has(entry.messageType)) {
      this.indexByType.set(entry.messageType, []);
    }
    this.indexByType.get(entry.messageType).push(entry.sequence);

    // Index by correlation ID
    if (entry.correlationId) {
      if (!this.indexByCorrelationId.has(entry.correlationId)) {
        this.indexByCorrelationId.set(entry.correlationId, []);
      }
      this.indexByCorrelationId.get(entry.correlationId).push(entry.sequence);
    }

    // Index by timestamp
    this.indexByTimestamp.push({
      sequence: entry.sequence,
      timestamp: entry.timestamp
    });

    // Sort timestamp index
    this.indexByTimestamp.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Rebuild all indexes
   */
  rebuildIndexes() {
    this.indexByType.clear();
    this.indexByCorrelationId.clear();
    this.indexByTimestamp = [];

    for (const entry of this.journal) {
      if (entry) {
        this.updateIndexes(entry);
      }
    }
  }

  /**
   * Update metrics
   */
  updateMetrics(entry) {
    this.metrics.totalMessages++;
    this.metrics.journalSize = this.journal.length;

    if (!this.metrics.oldestEntry || entry.timestamp < this.metrics.oldestEntry) {
      this.metrics.oldestEntry = entry.timestamp;
    }

    if (!this.metrics.newestEntry || entry.timestamp > this.metrics.newestEntry) {
      this.metrics.newestEntry = entry.timestamp;
    }

    // Track by type
    if (!this.metrics.messagesByType[entry.messageType]) {
      this.metrics.messagesByType[entry.messageType] = 0;
    }
    this.metrics.messagesByType[entry.messageType]++;

    // Update average size
    const totalSize = this.journal.reduce((sum, e) => sum + (e.metadata.size || 0), 0);
    this.metrics.averageMessageSize = totalSize / this.journal.length;
  }

  /**
   * Encrypt message
   */
  encrypt(message) {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not configured');
    }

    // Simple encryption (in production, use proper encryption library)
    const messageStr = JSON.stringify(message);
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(messageStr, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      _encrypted: true,
      data: encrypted
    };
  }

  /**
   * Decrypt message
   */
  decrypt(encryptedData) {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not configured');
    }

    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  /**
   * Compress message
   */
  compress(message) {
    // Simple compression - in production use zlib
    return {
      _compressed: true,
      data: JSON.stringify(message)
    };
  }

  /**
   * Decompress message
   */
  decompress(compressedData) {
    return JSON.parse(compressedData);
  }

  /**
   * Decode message (decrypt/decompress)
   */
  decodeMessage(entry) {
    let message = entry.message;

    if (entry.metadata.encrypted && message._encrypted) {
      message = this.decrypt(message.data);
    }

    if (entry.metadata.compressed && message._compressed) {
      message = this.decompress(message.data);
    }

    return message;
  }

  /**
   * Get journal statistics
   */
  getStats() {
    return {
      ...this.metrics,
      currentSize: this.journal.length,
      archivedCount: this.archivedCount,
      snapshotCount: this.snapshots.length,
      lastSnapshotSequence: this.lastSnapshotPosition,
      replayCallbacks: this.replayCallbacks.length,
      replayInProgress: this.replayInProgress
    };
  }

  /**
   * Generate entry ID
   */
  generateEntryId() {
    return `entry_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Generate snapshot ID
   */
  generateSnapshotId() {
    return `snapshot_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear journal
   */
  clear() {
    this.journal = [];
    this.indexByType.clear();
    this.indexByCorrelationId.clear();
    this.indexByTimestamp = [];
    this.snapshots = [];
    this.lastSnapshotPosition = 0;
  }

  /**
   * Reset all state
   */
  reset() {
    this.clear();
    this.metrics = {
      totalMessages: 0,
      totalReplays: 0,
      totalSnapshots: 0,
      journalSize: 0,
      oldestEntry: null,
      newestEntry: null,
      messagesByType: {},
      averageMessageSize: 0
    };
    this.archivedCount = 0;
    this.replayCallbacks = [];
    this.emit('reset');
  }
}

module.exports = MessageJournal;
