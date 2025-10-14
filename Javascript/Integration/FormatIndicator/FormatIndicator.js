/**
 * FormatIndicator Pattern
 *
 * Indicates the format of a message so that receivers can process it correctly.
 * Supports format detection, validation, and routing based on content type.
 */

const EventEmitter = require('events');

class FormatIndicator extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      defaultFormat: config.defaultFormat || 'json',
      strictMode: config.strictMode !== false,
      autoDetect: config.autoDetect !== false,
      ...config
    };

    this.formatHandlers = new Map();
    this.formatValidators = new Map();
    this.formatConverters = new Map();
    this.statistics = {
      messagesProcessed: 0,
      formatDetections: 0,
      conversions: 0,
      validationFailures: 0
    };

    this.registerDefaultFormats();
  }

  /**
   * Register default format handlers
   */
  registerDefaultFormats() {
    // JSON format
    this.registerFormat('json', {
      detect: (data) => {
        try {
          if (typeof data === 'string') {
            JSON.parse(data);
            return true;
          }
          return typeof data === 'object';
        } catch {
          return false;
        }
      },
      validate: (data) => {
        try {
          if (typeof data === 'string') {
            JSON.parse(data);
          }
          return true;
        } catch (error) {
          return { valid: false, error: error.message };
        }
      },
      parse: (data) => {
        if (typeof data === 'string') {
          return JSON.parse(data);
        }
        return data;
      },
      stringify: (data) => JSON.stringify(data)
    });

    // XML format
    this.registerFormat('xml', {
      detect: (data) => {
        if (typeof data !== 'string') return false;
        return /<\?xml|<[a-zA-Z]/.test(data.trim());
      },
      validate: (data) => {
        if (typeof data !== 'string') {
          return { valid: false, error: 'XML must be a string' };
        }
        const trimmed = data.trim();
        if (!trimmed.startsWith('<')) {
          return { valid: false, error: 'Invalid XML format' };
        }
        return true;
      },
      parse: (data) => {
        // Simplified XML parsing
        return { xml: data, parsed: this.parseSimpleXML(data) };
      },
      stringify: (data) => {
        if (typeof data === 'string') return data;
        return this.objectToXML(data);
      }
    });

    // CSV format
    this.registerFormat('csv', {
      detect: (data) => {
        if (typeof data !== 'string') return false;
        const lines = data.split('\n');
        return lines.length > 0 && lines[0].includes(',');
      },
      validate: (data) => {
        if (typeof data !== 'string') {
          return { valid: false, error: 'CSV must be a string' };
        }
        return true;
      },
      parse: (data) => {
        const lines = data.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = values[index];
          });
          return obj;
        });
        return rows;
      },
      stringify: (data) => {
        if (typeof data === 'string') return data;
        if (!Array.isArray(data)) data = [data];
        if (data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csv = [headers.join(',')];
        data.forEach(row => {
          csv.push(headers.map(h => row[h] || '').join(','));
        });
        return csv.join('\n');
      }
    });

    // Plain text format
    this.registerFormat('text', {
      detect: (data) => typeof data === 'string',
      validate: () => true,
      parse: (data) => ({ text: data }),
      stringify: (data) => {
        if (typeof data === 'string') return data;
        if (data.text) return data.text;
        return String(data);
      }
    });

    // Binary format
    this.registerFormat('binary', {
      detect: (data) => data instanceof Buffer || data instanceof ArrayBuffer,
      validate: (data) => {
        if (!(data instanceof Buffer) && !(data instanceof ArrayBuffer)) {
          return { valid: false, error: 'Must be Buffer or ArrayBuffer' };
        }
        return true;
      },
      parse: (data) => ({ binary: data }),
      stringify: (data) => {
        if (data instanceof Buffer) return data;
        if (data.binary) return data.binary;
        return Buffer.from(String(data));
      }
    });
  }

  /**
   * Register a format handler
   */
  registerFormat(formatName, handler) {
    if (!handler.detect || !handler.validate || !handler.parse || !handler.stringify) {
      throw new Error('Format handler must implement: detect, validate, parse, stringify');
    }

    this.formatHandlers.set(formatName, handler);
    this.emit('formatRegistered', { formatName });
  }

  /**
   * Detect message format
   */
  detectFormat(data) {
    this.statistics.formatDetections++;

    for (const [formatName, handler] of this.formatHandlers) {
      try {
        if (handler.detect(data)) {
          this.emit('formatDetected', { format: formatName });
          return formatName;
        }
      } catch (error) {
        this.emit('detectionError', { formatName, error: error.message });
      }
    }

    return this.config.defaultFormat;
  }

  /**
   * Validate message format
   */
  validateFormat(data, format) {
    if (!format) {
      format = this.detectFormat(data);
    }

    const handler = this.formatHandlers.get(format);
    if (!handler) {
      const error = `Unknown format: ${format}`;
      this.emit('validationError', { format, error });
      return { valid: false, error };
    }

    try {
      const result = handler.validate(data);
      if (result === true) {
        return { valid: true, format };
      }

      this.statistics.validationFailures++;
      this.emit('validationFailed', { format, result });
      return result;
    } catch (error) {
      this.statistics.validationFailures++;
      this.emit('validationError', { format, error: error.message });
      return { valid: false, error: error.message };
    }
  }

  /**
   * Process message with format indicator
   */
  processMessage(message, options = {}) {
    this.statistics.messagesProcessed++;

    const format = options.format || message.format || this.detectFormat(message.data);

    const messageWithFormat = {
      id: message.id || this.generateId(),
      format,
      data: message.data,
      metadata: {
        originalFormat: message.format,
        detectedFormat: format,
        timestamp: Date.now(),
        ...message.metadata
      }
    };

    // Validate if in strict mode
    if (this.config.strictMode) {
      const validation = this.validateFormat(message.data, format);
      if (!validation.valid) {
        const error = new Error(`Format validation failed: ${validation.error}`);
        this.emit('processingError', { message: messageWithFormat, error });
        throw error;
      }
    }

    this.emit('messageProcessed', messageWithFormat);
    return messageWithFormat;
  }

  /**
   * Parse message data based on format
   */
  parseMessage(message) {
    const format = message.format || this.detectFormat(message.data);
    const handler = this.formatHandlers.get(format);

    if (!handler) {
      throw new Error(`No handler for format: ${format}`);
    }

    try {
      const parsed = handler.parse(message.data);
      this.emit('messageParsed', { format, parsed });
      return {
        ...message,
        parsed,
        format
      };
    } catch (error) {
      this.emit('parseError', { format, error: error.message });
      throw error;
    }
  }

  /**
   * Convert message to different format
   */
  convertFormat(message, targetFormat) {
    const sourceFormat = message.format || this.detectFormat(message.data);

    if (sourceFormat === targetFormat) {
      return message;
    }

    this.statistics.conversions++;

    const sourceHandler = this.formatHandlers.get(sourceFormat);
    const targetHandler = this.formatHandlers.get(targetFormat);

    if (!sourceHandler || !targetHandler) {
      throw new Error(`Cannot convert from ${sourceFormat} to ${targetFormat}`);
    }

    try {
      // Parse source format
      const parsed = sourceHandler.parse(message.data);

      // Stringify to target format
      const converted = targetHandler.stringify(parsed);

      const result = {
        ...message,
        format: targetFormat,
        data: converted,
        metadata: {
          ...message.metadata,
          originalFormat: sourceFormat,
          convertedFrom: sourceFormat,
          convertedAt: Date.now()
        }
      };

      this.emit('formatConverted', {
        from: sourceFormat,
        to: targetFormat,
        message: result
      });

      return result;
    } catch (error) {
      this.emit('conversionError', {
        from: sourceFormat,
        to: targetFormat,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Batch process messages
   */
  processBatch(messages, options = {}) {
    const results = {
      processed: [],
      failed: []
    };

    messages.forEach(message => {
      try {
        const processed = this.processMessage(message, options);
        results.processed.push(processed);
      } catch (error) {
        results.failed.push({
          message,
          error: error.message
        });
      }
    });

    this.emit('batchProcessed', results);
    return results;
  }

  /**
   * Route message based on format
   */
  routeByFormat(message, routes) {
    const format = message.format || this.detectFormat(message.data);
    const route = routes[format] || routes.default;

    if (!route) {
      throw new Error(`No route defined for format: ${format}`);
    }

    this.emit('messageRouted', { format, route: route.name || 'unnamed' });
    return route(message);
  }

  /**
   * Get supported formats
   */
  getSupportedFormats() {
    return Array.from(this.formatHandlers.keys());
  }

  /**
   * Check if format is supported
   */
  isFormatSupported(format) {
    return this.formatHandlers.has(format);
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Simple XML parser helper
   */
  parseSimpleXML(xml) {
    const result = {};
    const tagRegex = /<([^>]+)>([^<]*)<\/\1>/g;
    let match;

    while ((match = tagRegex.exec(xml)) !== null) {
      result[match[1]] = match[2];
    }

    return result;
  }

  /**
   * Object to XML helper
   */
  objectToXML(obj, rootTag = 'root') {
    if (typeof obj === 'string') return obj;

    const lines = [`<${rootTag}>`];

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        lines.push(this.objectToXML(value, key));
      } else {
        lines.push(`  <${key}>${value}</${key}>`);
      }
    }

    lines.push(`</${rootTag}>`);
    return lines.join('\n');
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      ...this.statistics,
      supportedFormats: this.formatHandlers.size,
      successRate: this.statistics.messagesProcessed > 0
        ? ((this.statistics.messagesProcessed - this.statistics.validationFailures) /
           this.statistics.messagesProcessed * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }

  /**
   * Reset statistics
   */
  resetStatistics() {
    this.statistics = {
      messagesProcessed: 0,
      formatDetections: 0,
      conversions: 0,
      validationFailures: 0
    };
  }

  /**
   * Execute pattern demonstration
   */
  execute() {
    console.log('FormatIndicator Pattern - Managing message formats');

    // Test JSON
    const jsonMsg = this.processMessage({
      data: { name: 'John', age: 30 }
    });
    console.log('JSON message:', jsonMsg.format);

    // Test CSV
    const csvMsg = this.processMessage({
      data: 'name,age\nJohn,30\nJane,25'
    });
    console.log('CSV message:', csvMsg.format);

    // Test conversion
    const converted = this.convertFormat(jsonMsg, 'csv');
    console.log('Converted to CSV:', converted.format);

    console.log('Statistics:', this.getStatistics());

    return {
      success: true,
      pattern: 'FormatIndicator',
      supportedFormats: this.getSupportedFormats(),
      statistics: this.getStatistics()
    };
  }
}

module.exports = FormatIndicator;
