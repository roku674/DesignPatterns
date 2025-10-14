/**
 * MessagingMapper Pattern Implementation
 *
 * Purpose:
 * Maps between domain objects and messages, separating business logic
 * from messaging concerns through bidirectional transformation.
 *
 * Use Cases:
 * - Domain object to message transformation
 * - Message to domain object reconstruction
 * - Persistence layer integration
 * - Service layer decoupling
 *
 * Components:
 * - MessagingMapper: Base mapper with bidirectional mapping
 * - DomainToMessageMapper: Domain to message conversion
 * - MessageToDomainMapper: Message to domain conversion
 * - BidirectionalMapper: Two-way mapping support
 */

/**
 * Mapper Error
 */
class MapperError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'MapperError';
        this.code = code;
    }
}

/**
 * Base Messaging Mapper
 */
class MessagingMapper {
    constructor(options = {}) {
        this.toMessageMapper = options.toMessageMapper || null;
        this.fromMessageMapper = options.fromMessageMapper || null;
        this.strict = options.strict !== false;
        this.mappingCount = 0;
        this.errorCount = 0;
    }

    /**
     * Map domain object to message
     */
    toMessage(domainObject) {
        try {
            if (!this.toMessageMapper) {
                throw new MapperError('No toMessageMapper configured', 'NO_MAPPER');
            }

            const message = this.toMessageMapper(domainObject);
            this.mappingCount++;
            return message;
        } catch (error) {
            this.errorCount++;
            if (this.strict) {
                throw new MapperError(
                    `Failed to map to message: ${error.message}`,
                    'MAPPING_FAILED'
                );
            }
            return null;
        }
    }

    /**
     * Map message to domain object
     */
    fromMessage(message) {
        try {
            if (!this.fromMessageMapper) {
                throw new MapperError('No fromMessageMapper configured', 'NO_MAPPER');
            }

            const domainObject = this.fromMessageMapper(message);
            this.mappingCount++;
            return domainObject;
        } catch (error) {
            this.errorCount++;
            if (this.strict) {
                throw new MapperError(
                    `Failed to map from message: ${error.message}`,
                    'MAPPING_FAILED'
                );
            }
            return null;
        }
    }

    /**
     * Get mapper statistics
     */
    getStats() {
        return {
            mappingCount: this.mappingCount,
            errorCount: this.errorCount
        };
    }
}

/**
 * Field-Based Mapper
 */
class FieldBasedMapper extends MessagingMapper {
    constructor(fieldMappings, options = {}) {
        super(options);
        this.fieldMappings = fieldMappings;
        this.reverseMappings = this._createReverseMappings(fieldMappings);
    }

    /**
     * Create reverse field mappings
     */
    _createReverseMappings(mappings) {
        const reverse = {};
        for (const [messageField, domainField] of Object.entries(mappings)) {
            if (typeof domainField === 'string') {
                reverse[domainField] = messageField;
            }
        }
        return reverse;
    }

    /**
     * Map domain object to message
     */
    toMessage(domainObject) {
        const message = { headers: {}, payload: {} };

        for (const [messageField, domainFieldOrFn] of Object.entries(this.fieldMappings)) {
            let value;

            if (typeof domainFieldOrFn === 'function') {
                value = domainFieldOrFn(domainObject);
            } else {
                value = this._getNestedValue(domainObject, domainFieldOrFn);
            }

            this._setNestedValue(message.payload, messageField, value);
        }

        this.mappingCount++;
        return message;
    }

    /**
     * Map message to domain object
     */
    fromMessage(message) {
        const domainObject = {};
        const payload = message.payload || message;

        for (const [domainField, messageField] of Object.entries(this.reverseMappings)) {
            const value = this._getNestedValue(payload, messageField);
            this._setNestedValue(domainObject, domainField, value);
        }

        this.mappingCount++;
        return domainObject;
    }

    /**
     * Get nested value from object
     */
    _getNestedValue(obj, path) {
        return path.split('.').reduce((current, prop) => {
            return current ? current[prop] : undefined;
        }, obj);
    }

    /**
     * Set nested value in object
     */
    _setNestedValue(obj, path, value) {
        const parts = path.split('.');
        const lastPart = parts.pop();

        const target = parts.reduce((current, prop) => {
            if (!current[prop]) {
                current[prop] = {};
            }
            return current[prop];
        }, obj);

        target[lastPart] = value;
    }
}

/**
 * Class-Based Mapper
 */
class ClassBasedMapper extends MessagingMapper {
    constructor(DomainClass, options = {}) {
        super(options);
        this.DomainClass = DomainClass;
        this.messageType = options.messageType || DomainClass.name;
    }

    /**
     * Map domain object to message
     */
    toMessage(domainObject) {
        if (!(domainObject instanceof this.DomainClass)) {
            throw new MapperError(
                `Object is not an instance of ${this.DomainClass.name}`,
                'INVALID_TYPE'
            );
        }

        const message = {
            headers: {
                type: this.messageType,
                timestamp: Date.now()
            },
            payload: {}
        };

        if (domainObject.toJSON) {
            message.payload = domainObject.toJSON();
        } else {
            message.payload = { ...domainObject };
        }

        this.mappingCount++;
        return message;
    }

    /**
     * Map message to domain object
     */
    fromMessage(message) {
        const payload = message.payload || message;

        let domainObject;
        if (this.DomainClass.fromJSON) {
            domainObject = this.DomainClass.fromJSON(payload);
        } else {
            domainObject = Object.assign(new this.DomainClass(), payload);
        }

        this.mappingCount++;
        return domainObject;
    }
}

/**
 * Schema-Based Mapper
 */
class SchemaBasedMapper extends MessagingMapper {
    constructor(schema, options = {}) {
        super(options);
        this.schema = schema;
    }

    /**
     * Map domain object to message
     */
    toMessage(domainObject) {
        const message = { headers: {}, payload: {} };

        for (const [field, config] of Object.entries(this.schema)) {
            let value = domainObject[field];

            if (value === undefined && config.required) {
                throw new MapperError(
                    `Required field ${field} is missing`,
                    'REQUIRED_FIELD_MISSING'
                );
            }

            if (value !== undefined) {
                if (config.transform) {
                    value = config.transform(value);
                }

                if (config.messageField) {
                    message.payload[config.messageField] = value;
                } else {
                    message.payload[field] = value;
                }
            } else if (config.default !== undefined) {
                message.payload[field] = config.default;
            }
        }

        this.mappingCount++;
        return message;
    }

    /**
     * Map message to domain object
     */
    fromMessage(message) {
        const domainObject = {};
        const payload = message.payload || message;

        for (const [field, config] of Object.entries(this.schema)) {
            const messageField = config.messageField || field;
            let value = payload[messageField];

            if (value === undefined && config.default !== undefined) {
                value = config.default;
            }

            if (value === undefined && config.required) {
                throw new MapperError(
                    `Required field ${field} is missing`,
                    'REQUIRED_FIELD_MISSING'
                );
            }

            if (value !== undefined) {
                if (config.reverseTransform) {
                    value = config.reverseTransform(value);
                }
                domainObject[field] = value;
            }
        }

        this.mappingCount++;
        return domainObject;
    }
}

/**
 * Composite Mapper
 */
class CompositeMapper extends MessagingMapper {
    constructor(mappers = [], options = {}) {
        super(options);
        this.mappers = mappers;
    }

    /**
     * Add mapper to chain
     */
    addMapper(mapper) {
        this.mappers.push(mapper);
        return this;
    }

    /**
     * Map using first successful mapper
     */
    toMessage(domainObject) {
        for (const mapper of this.mappers) {
            try {
                const message = mapper.toMessage(domainObject);
                this.mappingCount++;
                return message;
            } catch (error) {
                continue;
            }
        }

        this.errorCount++;
        throw new MapperError('No mapper could handle the domain object', 'NO_MAPPER_MATCH');
    }

    /**
     * Map using first successful mapper
     */
    fromMessage(message) {
        for (const mapper of this.mappers) {
            try {
                const domainObject = mapper.fromMessage(message);
                this.mappingCount++;
                return domainObject;
            } catch (error) {
                continue;
            }
        }

        this.errorCount++;
        throw new MapperError('No mapper could handle the message', 'NO_MAPPER_MATCH');
    }

    /**
     * Get composite statistics
     */
    getStats() {
        return {
            mappingCount: this.mappingCount,
            errorCount: this.errorCount,
            mapperCount: this.mappers.length,
            mappers: this.mappers.map(m => m.getStats())
        };
    }
}

/**
 * Registry Mapper
 */
class MapperRegistry {
    constructor() {
        this.mappers = new Map();
    }

    /**
     * Register mapper for type
     */
    register(type, mapper) {
        this.mappers.set(type, mapper);
        return this;
    }

    /**
     * Unregister mapper
     */
    unregister(type) {
        this.mappers.delete(type);
        return this;
    }

    /**
     * Get mapper for type
     */
    getMapper(type) {
        const mapper = this.mappers.get(type);
        if (!mapper) {
            throw new MapperError(`No mapper registered for type: ${type}`, 'MAPPER_NOT_FOUND');
        }
        return mapper;
    }

    /**
     * Map domain object to message
     */
    toMessage(type, domainObject) {
        const mapper = this.getMapper(type);
        return mapper.toMessage(domainObject);
    }

    /**
     * Map message to domain object
     */
    fromMessage(type, message) {
        const mapper = this.getMapper(type);
        return mapper.fromMessage(message);
    }

    /**
     * List registered types
     */
    getRegisteredTypes() {
        return Array.from(this.mappers.keys());
    }
}

/**
 * Example Usage and Testing
 */
function demonstrateMessagingMapperPattern() {
    console.log('=== MessagingMapper Pattern Demonstration ===\n');

    // Example 1: Field-Based Mapper
    console.log('1. Field-Based Mapper:');
    const fieldMapper = new FieldBasedMapper({
        'orderId': 'id',
        'customerName': 'customer.name',
        'orderTotal': 'total',
        'itemCount': (obj) => obj.items ? obj.items.length : 0
    });

    const order = {
        id: '12345',
        customer: { name: 'John Doe', email: 'john@example.com' },
        total: 99.99,
        items: ['item1', 'item2', 'item3']
    };

    const message = fieldMapper.toMessage(order);
    console.log('Domain to Message:', message);

    const reconstructed = fieldMapper.fromMessage(message);
    console.log('Message to Domain:', reconstructed);
    console.log();

    // Example 2: Schema-Based Mapper
    console.log('2. Schema-Based Mapper:');
    const schemaMapper = new SchemaBasedMapper({
        id: { required: true, messageField: 'productId' },
        name: { required: true },
        price: { required: true, transform: (v) => Math.round(v * 100) },
        createdAt: { default: new Date().toISOString() }
    });

    const product = { id: 'P123', name: 'Widget', price: 19.99 };
    const productMessage = schemaMapper.toMessage(product);
    console.log('Product Message:', productMessage);
    console.log();

    // Example 3: Mapper Registry
    console.log('3. Mapper Registry:');
    const registry = new MapperRegistry();
    registry.register('Order', fieldMapper);
    registry.register('Product', schemaMapper);

    console.log('Registered types:', registry.getRegisteredTypes());

    const orderMsg = registry.toMessage('Order', order);
    console.log('Order mapped via registry:', orderMsg.payload.orderId);
    console.log();

    // Example 4: Composite Mapper
    console.log('4. Composite Mapper:');
    const composite = new CompositeMapper([fieldMapper, schemaMapper]);
    console.log('Composite stats:', composite.getStats());
}

// Export classes
module.exports = {
    MessagingMapper,
    FieldBasedMapper,
    ClassBasedMapper,
    SchemaBasedMapper,
    CompositeMapper,
    MapperRegistry,
    MapperError,
    demonstrateMessagingMapperPattern
};

// Run demonstration if executed directly
if (require.main === module) {
    demonstrateMessagingMapperPattern();
}
