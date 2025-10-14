/**
 * Canonical Data Model Pattern
 *
 * Defines a common data format that all applications use when exchanging data,
 * eliminating the need for multiple format conversions and reducing complexity.
 */

const EventEmitter = require('events');

class CanonicalDataModel extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      strictValidation: config.strictValidation !== false,
      allowExtensions: config.allowExtensions !== false,
      version: config.version || '1.0',
      ...config
    };

    this.schema = this.defineCanonicalSchema();
    this.transformers = new Map();
    this.validators = new Map();
    this.statistics = {
      transformations: 0,
      validations: 0,
      failures: 0,
      extensionsUsed: 0
    };

    this.registerDefaultTransformers();
  }

  /**
   * Define the canonical schema
   */
  defineCanonicalSchema() {
    return {
      metadata: {
        id: { type: 'string', required: true },
        timestamp: { type: 'number', required: true },
        version: { type: 'string', required: true },
        source: { type: 'string', required: true },
        correlationId: { type: 'string', required: false }
      },
      entity: {
        type: { type: 'string', required: true },
        id: { type: 'string', required: true },
        attributes: { type: 'object', required: true }
      },
      relationships: {
        type: 'array',
        required: false,
        items: {
          type: { type: 'string', required: true },
          targetId: { type: 'string', required: true },
          attributes: { type: 'object', required: false }
        }
      },
      extensions: {
        type: 'object',
        required: false
      }
    };
  }

  /**
   * Register default transformers for common formats
   */
  registerDefaultTransformers() {
    // JSON to Canonical
    this.registerTransformer('json', 'canonical', (data) => {
      return this.createCanonicalModel({
        type: data.entityType || 'Unknown',
        id: data.id || this.generateId(),
        attributes: data,
        source: 'json'
      });
    });

    // XML to Canonical
    this.registerTransformer('xml', 'canonical', (data) => {
      const attributes = this.parseXMLAttributes(data);
      return this.createCanonicalModel({
        type: attributes.type || 'Unknown',
        id: attributes.id || this.generateId(),
        attributes,
        source: 'xml'
      });
    });

    // REST to Canonical
    this.registerTransformer('rest', 'canonical', (data) => {
      return this.createCanonicalModel({
        type: data.resourceType || 'Resource',
        id: data.id || this.generateId(),
        attributes: data.attributes || data,
        source: 'rest'
      });
    });

    // Database to Canonical
    this.registerTransformer('database', 'canonical', (data) => {
      return this.createCanonicalModel({
        type: data.table || 'Record',
        id: data.id || data._id || this.generateId(),
        attributes: data,
        source: 'database'
      });
    });
  }

  /**
   * Create a canonical data model
   */
  createCanonicalModel(options = {}) {
    const canonical = {
      metadata: {
        id: options.id || this.generateId(),
        timestamp: Date.now(),
        version: this.config.version,
        source: options.source || 'unknown',
        correlationId: options.correlationId || null
      },
      entity: {
        type: options.type || 'Unknown',
        id: options.id || this.generateId(),
        attributes: options.attributes || {}
      },
      relationships: options.relationships || [],
      extensions: options.extensions || {}
    };

    if (this.config.strictValidation) {
      this.validate(canonical);
    }

    this.emit('modelCreated', {
      id: canonical.metadata.id,
      type: canonical.entity.type
    });

    return canonical;
  }

  /**
   * Transform data to canonical format
   */
  toCanonical(data, sourceFormat) {
    try {
      this.statistics.transformations++;

      const transformKey = `${sourceFormat}-canonical`;
      const transformer = this.transformers.get(transformKey);

      if (!transformer) {
        throw new Error(`No transformer found for ${sourceFormat} to canonical`);
      }

      const canonical = transformer(data);

      if (this.config.strictValidation) {
        this.validate(canonical);
      }

      this.emit('transformed', {
        from: sourceFormat,
        to: 'canonical',
        id: canonical.metadata.id
      });

      return canonical;
    } catch (error) {
      this.statistics.failures++;
      this.emit('transformationError', {
        sourceFormat,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Transform from canonical to target format
   */
  fromCanonical(canonical, targetFormat) {
    try {
      this.statistics.transformations++;

      const transformKey = `canonical-${targetFormat}`;
      const transformer = this.transformers.get(transformKey);

      if (!transformer) {
        throw new Error(`No transformer found from canonical to ${targetFormat}`);
      }

      const result = transformer(canonical);

      this.emit('transformed', {
        from: 'canonical',
        to: targetFormat,
        id: canonical.metadata.id
      });

      return result;
    } catch (error) {
      this.statistics.failures++;
      this.emit('transformationError', {
        targetFormat,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Validate canonical model
   */
  validate(canonical) {
    this.statistics.validations++;

    const errors = [];

    // Validate metadata
    errors.push(...this.validateSection(canonical.metadata, this.schema.metadata, 'metadata'));

    // Validate entity
    errors.push(...this.validateSection(canonical.entity, this.schema.entity, 'entity'));

    // Validate relationships if present
    if (canonical.relationships) {
      if (!Array.isArray(canonical.relationships)) {
        errors.push('relationships must be an array');
      } else {
        canonical.relationships.forEach((rel, index) => {
          errors.push(...this.validateSection(rel, this.schema.relationships.items, `relationships[${index}]`));
        });
      }
    }

    if (errors.length > 0) {
      this.statistics.failures++;
      const error = new Error(`Validation failed: ${errors.join(', ')}`);
      this.emit('validationError', { errors });
      throw error;
    }

    this.emit('validated', { id: canonical.metadata.id });
    return true;
  }

  /**
   * Validate a section against schema
   */
  validateSection(data, schemaSection, path) {
    const errors = [];

    for (const [field, rules] of Object.entries(schemaSection)) {
      if (rules.required && !(field in data)) {
        errors.push(`${path}.${field} is required`);
      }

      if (field in data && rules.type) {
        const actualType = Array.isArray(data[field]) ? 'array' : typeof data[field];
        if (actualType !== rules.type) {
          errors.push(`${path}.${field} must be ${rules.type}, got ${actualType}`);
        }
      }
    }

    return errors;
  }

  /**
   * Register a custom transformer
   */
  registerTransformer(sourceFormat, targetFormat, transformFn) {
    const key = `${sourceFormat}-${targetFormat}`;
    this.transformers.set(key, transformFn);

    this.emit('transformerRegistered', {
      source: sourceFormat,
      target: targetFormat
    });
  }

  /**
   * Add relationship to canonical model
   */
  addRelationship(canonical, relationship) {
    if (!canonical.relationships) {
      canonical.relationships = [];
    }

    const rel = {
      type: relationship.type,
      targetId: relationship.targetId,
      attributes: relationship.attributes || {}
    };

    canonical.relationships.push(rel);

    this.emit('relationshipAdded', {
      id: canonical.metadata.id,
      relationship: rel
    });

    return canonical;
  }

  /**
   * Add extension to canonical model
   */
  addExtension(canonical, extensionName, extensionData) {
    if (!this.config.allowExtensions) {
      throw new Error('Extensions are not allowed in this configuration');
    }

    if (!canonical.extensions) {
      canonical.extensions = {};
    }

    canonical.extensions[extensionName] = extensionData;
    this.statistics.extensionsUsed++;

    this.emit('extensionAdded', {
      id: canonical.metadata.id,
      extension: extensionName
    });

    return canonical;
  }

  /**
   * Merge multiple canonical models
   */
  merge(models) {
    if (!Array.isArray(models) || models.length === 0) {
      throw new Error('Must provide array of canonical models to merge');
    }

    const merged = this.createCanonicalModel({
      type: 'Merged',
      id: this.generateId(),
      attributes: {},
      source: 'merge'
    });

    // Merge attributes
    models.forEach(model => {
      Object.assign(merged.entity.attributes, model.entity.attributes);
    });

    // Merge relationships
    merged.relationships = models.reduce((acc, model) => {
      return acc.concat(model.relationships || []);
    }, []);

    // Merge extensions
    models.forEach(model => {
      if (model.extensions) {
        Object.assign(merged.extensions, model.extensions);
      }
    });

    this.emit('modelsMerged', {
      count: models.length,
      resultId: merged.metadata.id
    });

    return merged;
  }

  /**
   * Clone canonical model
   */
  clone(canonical) {
    const cloned = JSON.parse(JSON.stringify(canonical));
    cloned.metadata.id = this.generateId();
    cloned.metadata.timestamp = Date.now();
    cloned.entity.id = this.generateId();

    this.emit('modelCloned', {
      originalId: canonical.metadata.id,
      clonedId: cloned.metadata.id
    });

    return cloned;
  }

  /**
   * Extract attributes from canonical model
   */
  extractAttributes(canonical, attributeNames) {
    const extracted = {};

    attributeNames.forEach(name => {
      if (name in canonical.entity.attributes) {
        extracted[name] = canonical.entity.attributes[name];
      }
    });

    return extracted;
  }

  /**
   * Update attributes in canonical model
   */
  updateAttributes(canonical, updates) {
    Object.assign(canonical.entity.attributes, updates);
    canonical.metadata.timestamp = Date.now();

    this.emit('attributesUpdated', {
      id: canonical.metadata.id,
      updates: Object.keys(updates)
    });

    return canonical;
  }

  /**
   * Parse XML attributes (simplified)
   */
  parseXMLAttributes(xmlString) {
    const attributes = {};
    const tagRegex = /<([^>]+)>([^<]*)<\/\1>/g;
    let match;

    while ((match = tagRegex.exec(xmlString)) !== null) {
      attributes[match[1]] = match[2];
    }

    return attributes;
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `cdm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get schema
   */
  getSchema() {
    return JSON.parse(JSON.stringify(this.schema));
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      ...this.statistics,
      successRate: this.statistics.transformations > 0
        ? ((this.statistics.transformations - this.statistics.failures) /
           this.statistics.transformations * 100).toFixed(2) + '%'
        : 'N/A',
      transformersRegistered: this.transformers.size
    };
  }

  /**
   * Reset statistics
   */
  resetStatistics() {
    this.statistics = {
      transformations: 0,
      validations: 0,
      failures: 0,
      extensionsUsed: 0
    };
  }

  /**
   * Execute pattern demonstration
   */
  execute() {
    console.log('CanonicalDataModel Pattern - Standardizing data formats');

    // Create canonical model
    const canonical = this.createCanonicalModel({
      type: 'User',
      id: 'user-123',
      attributes: {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin'
      },
      source: 'api'
    });

    console.log('Canonical model created:', canonical.metadata.id);
    console.log('Entity type:', canonical.entity.type);

    // Add relationship
    this.addRelationship(canonical, {
      type: 'manages',
      targetId: 'team-456'
    });

    console.log('Relationships:', canonical.relationships.length);

    // Add extension
    this.addExtension(canonical, 'customData', { department: 'Engineering' });

    console.log('Statistics:', this.getStatistics());

    return {
      success: true,
      pattern: 'CanonicalDataModel',
      statistics: this.getStatistics()
    };
  }
}

module.exports = CanonicalDataModel;
