/**
 * ChannelAdapter Pattern
 *
 * Connects applications with incompatible interfaces by translating messages
 * between different protocols, data formats, or communication patterns.
 */

const EventEmitter = require('events');

class ChannelAdapter extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      defaultProtocol: config.defaultProtocol || 'http',
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      ...config
    };

    this.adapters = new Map();
    this.protocolHandlers = new Map();
    this.activeConnections = new Map();
    this.statistics = {
      messagesAdapted: 0,
      protocolTranslations: 0,
      failures: 0,
      retries: 0
    };

    this.registerDefaultProtocols();
  }

  /**
   * Register default protocol handlers
   */
  registerDefaultProtocols() {
    // HTTP protocol
    this.registerProtocol('http', {
      send: async (message, endpoint) => {
        return {
          status: 'sent',
          protocol: 'http',
          endpoint,
          message
        };
      },
      receive: async (data) => {
        return {
          protocol: 'http',
          data
        };
      }
    });

    // WebSocket protocol
    this.registerProtocol('websocket', {
      send: async (message, endpoint) => {
        return {
          status: 'sent',
          protocol: 'websocket',
          endpoint,
          message
        };
      },
      receive: async (data) => {
        return {
          protocol: 'websocket',
          data
        };
      }
    });

    // Message Queue protocol
    this.registerProtocol('queue', {
      send: async (message, endpoint) => {
        return {
          status: 'queued',
          protocol: 'queue',
          queue: endpoint,
          message
        };
      },
      receive: async (data) => {
        return {
          protocol: 'queue',
          data
        };
      }
    });

    // File system protocol
    this.registerProtocol('file', {
      send: async (message, endpoint) => {
        return {
          status: 'written',
          protocol: 'file',
          path: endpoint,
          message
        };
      },
      receive: async (data) => {
        return {
          protocol: 'file',
          data
        };
      }
    });

    // Database protocol
    this.registerProtocol('database', {
      send: async (message, endpoint) => {
        return {
          status: 'inserted',
          protocol: 'database',
          collection: endpoint,
          message
        };
      },
      receive: async (data) => {
        return {
          protocol: 'database',
          data
        };
      }
    });
  }

  /**
   * Register a protocol handler
   */
  registerProtocol(protocolName, handler) {
    if (!handler.send || !handler.receive) {
      throw new Error('Protocol handler must implement send and receive methods');
    }

    this.protocolHandlers.set(protocolName, handler);

    this.emit('protocolRegistered', { protocol: protocolName });
  }

  /**
   * Create an adapter between two protocols
   */
  createAdapter(sourceProtocol, targetProtocol, transformFn) {
    const adapterKey = `${sourceProtocol}-to-${targetProtocol}`;

    const adapter = {
      sourceProtocol,
      targetProtocol,
      transform: transformFn || ((data) => data),
      createdAt: Date.now()
    };

    this.adapters.set(adapterKey, adapter);

    this.emit('adapterCreated', {
      adapter: adapterKey,
      source: sourceProtocol,
      target: targetProtocol
    });

    return adapter;
  }

  /**
   * Adapt message from source protocol to target protocol
   */
  async adapt(message, sourceProtocol, targetProtocol, options = {}) {
    try {
      this.statistics.messagesAdapted++;

      // Get adapter
      const adapterKey = `${sourceProtocol}-to-${targetProtocol}`;
      const adapter = this.adapters.get(adapterKey);

      if (!adapter) {
        throw new Error(`No adapter found for ${sourceProtocol} to ${targetProtocol}`);
      }

      // Transform message
      const transformed = adapter.transform(message);

      // Get target protocol handler
      const targetHandler = this.protocolHandlers.get(targetProtocol);

      if (!targetHandler) {
        throw new Error(`No handler found for protocol: ${targetProtocol}`);
      }

      // Send using target protocol
      const result = await this.sendWithRetry(
        transformed,
        targetHandler,
        options.endpoint || 'default',
        options.retries || this.config.retryAttempts
      );

      this.statistics.protocolTranslations++;

      this.emit('messageAdapted', {
        from: sourceProtocol,
        to: targetProtocol,
        success: true
      });

      return result;
    } catch (error) {
      this.statistics.failures++;
      this.emit('adaptationError', {
        from: sourceProtocol,
        to: targetProtocol,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Send message with retry logic
   */
  async sendWithRetry(message, handler, endpoint, maxRetries) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          this.statistics.retries++;
          this.emit('retrying', { attempt, maxRetries });

          // Exponential backoff
          await this.delay(Math.pow(2, attempt) * 1000);
        }

        const result = await handler.send(message, endpoint);
        return result;
      } catch (error) {
        lastError = error;
        this.emit('sendError', {
          attempt,
          error: error.message
        });
      }
    }

    throw new Error(`Failed after ${maxRetries} retries: ${lastError.message}`);
  }

  /**
   * Receive message from protocol
   */
  async receive(protocol, data) {
    try {
      const handler = this.protocolHandlers.get(protocol);

      if (!handler) {
        throw new Error(`No handler found for protocol: ${protocol}`);
      }

      const result = await handler.receive(data);

      this.emit('messageReceived', {
        protocol,
        success: true
      });

      return result;
    } catch (error) {
      this.emit('receiveError', {
        protocol,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Bridge two channels with different protocols
   */
  createBridge(sourceProtocol, targetProtocol, bidirectional = false) {
    // Create forward adapter
    this.createAdapter(sourceProtocol, targetProtocol);

    // Create reverse adapter if bidirectional
    if (bidirectional) {
      this.createAdapter(targetProtocol, sourceProtocol);
    }

    const bridgeId = `bridge-${Date.now()}`;

    const bridge = {
      id: bridgeId,
      sourceProtocol,
      targetProtocol,
      bidirectional,
      createdAt: Date.now(),
      active: true
    };

    this.activeConnections.set(bridgeId, bridge);

    this.emit('bridgeCreated', bridge);

    return bridge;
  }

  /**
   * Close a bridge
   */
  closeBridge(bridgeId) {
    const bridge = this.activeConnections.get(bridgeId);

    if (!bridge) {
      return false;
    }

    bridge.active = false;
    this.activeConnections.delete(bridgeId);

    this.emit('bridgeClosed', { bridgeId });

    return true;
  }

  /**
   * Translate message format
   */
  translateFormat(message, sourceFormat, targetFormat) {
    const formatTranslators = {
      'json-to-xml': (data) => this.jsonToXML(data),
      'xml-to-json': (data) => this.xmlToJSON(data),
      'json-to-csv': (data) => this.jsonToCSV(data),
      'csv-to-json': (data) => this.csvToJSON(data)
    };

    const translatorKey = `${sourceFormat}-to-${targetFormat}`;
    const translator = formatTranslators[translatorKey];

    if (!translator) {
      throw new Error(`No translator found for ${sourceFormat} to ${targetFormat}`);
    }

    return translator(message);
  }

  /**
   * JSON to XML converter
   */
  jsonToXML(json) {
    const obj = typeof json === 'string' ? JSON.parse(json) : json;
    let xml = '<?xml version="1.0"?>\n<root>\n';

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        xml += `  <${key}>${JSON.stringify(value)}</${key}>\n`;
      } else {
        xml += `  <${key}>${value}</${key}>\n`;
      }
    }

    xml += '</root>';
    return xml;
  }

  /**
   * XML to JSON converter
   */
  xmlToJSON(xml) {
    const result = {};
    const tagRegex = /<([^>]+)>([^<]*)<\/\1>/g;
    let match;

    while ((match = tagRegex.exec(xml)) !== null) {
      try {
        result[match[1]] = JSON.parse(match[2]);
      } catch {
        result[match[1]] = match[2];
      }
    }

    return JSON.stringify(result);
  }

  /**
   * JSON to CSV converter
   */
  jsonToCSV(json) {
    const arr = Array.isArray(json) ? json : [json];
    if (arr.length === 0) return '';

    const headers = Object.keys(arr[0]);
    const rows = [headers.join(',')];

    arr.forEach(obj => {
      const values = headers.map(h => {
        const value = obj[h];
        return typeof value === 'string' && value.includes(',')
          ? `"${value}"`
          : value;
      });
      rows.push(values.join(','));
    });

    return rows.join('\n');
  }

  /**
   * CSV to JSON converter
   */
  csvToJSON(csv) {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return '[]';

    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const obj = {};

      headers.forEach((header, index) => {
        obj[header] = values[index];
      });

      result.push(obj);
    }

    return JSON.stringify(result);
  }

  /**
   * Batch adapt messages
   */
  async adaptBatch(messages, sourceProtocol, targetProtocol, options = {}) {
    const results = {
      adapted: [],
      failed: []
    };

    for (const message of messages) {
      try {
        const adapted = await this.adapt(message, sourceProtocol, targetProtocol, options);
        results.adapted.push(adapted);
      } catch (error) {
        results.failed.push({
          message,
          error: error.message
        });
      }
    }

    this.emit('batchAdapted', {
      total: messages.length,
      success: results.adapted.length,
      failed: results.failed.length
    });

    return results;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get active bridges
   */
  getActiveBridges() {
    return Array.from(this.activeConnections.values());
  }

  /**
   * Get registered protocols
   */
  getRegisteredProtocols() {
    return Array.from(this.protocolHandlers.keys());
  }

  /**
   * Get registered adapters
   */
  getRegisteredAdapters() {
    return Array.from(this.adapters.keys());
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      ...this.statistics,
      activeBridges: this.activeConnections.size,
      registeredProtocols: this.protocolHandlers.size,
      registeredAdapters: this.adapters.size,
      successRate: this.statistics.messagesAdapted > 0
        ? (((this.statistics.messagesAdapted - this.statistics.failures) /
           this.statistics.messagesAdapted) * 100).toFixed(2) + '%'
        : 'N/A',
      retryRate: this.statistics.messagesAdapted > 0
        ? ((this.statistics.retries / this.statistics.messagesAdapted) * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }

  /**
   * Reset statistics
   */
  resetStatistics() {
    this.statistics = {
      messagesAdapted: 0,
      protocolTranslations: 0,
      failures: 0,
      retries: 0
    };
  }

  /**
   * Execute pattern demonstration
   */
  async execute() {
    console.log('ChannelAdapter Pattern - Translating between protocols');

    // Create adapter
    this.createAdapter('http', 'queue', (msg) => ({
      ...msg,
      queuePriority: 'high'
    }));

    // Adapt message
    const message = { type: 'order', data: { id: 123, amount: 100 } };
    const adapted = await this.adapt(message, 'http', 'queue', {
      endpoint: 'orders-queue'
    });

    console.log('Message adapted:', adapted.status);
    console.log('Target protocol:', adapted.protocol);

    // Create bridge
    const bridge = this.createBridge('http', 'websocket', true);
    console.log('Bridge created:', bridge.id);

    console.log('Statistics:', this.getStatistics());

    return {
      success: true,
      pattern: 'ChannelAdapter',
      statistics: this.getStatistics()
    };
  }
}

module.exports = ChannelAdapter;
