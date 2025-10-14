/**
 * MessageTranslator Pattern Implementation
 *
 * Purpose:
 * Transforms messages from one format to another enabling communication
 * between systems with different data formats or protocols.
 *
 * Use Cases:
 * - Protocol transformation (JSON to XML)
 * - Data format conversion
 * - Message normalization
 * - Legacy system integration
 *
 * Components:
 * - MessageTranslator: Base translator
 * - FormatTranslator: Format-specific transformations
 * - FieldMapper: Maps fields between formats
 * - TranslationChain: Chains multiple translators
 */

/**
 * Translation Error
 */
class TranslationError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'TranslationError';
        this.code = code;
    }
}

/**
 * Base Message Translator
 */
class MessageTranslator {
    constructor(options = {}) {
        this.sourceFormat = options.sourceFormat || 'unknown';
        this.targetFormat = options.targetFormat || 'unknown';
        this.strict = options.strict !== false;
        this.translationCount = 0;
        this.errorCount = 0;
    }

    /**
     * Translate message
     */
    translate(message) {
        try {
            const result = this._doTranslate(message);
            this.translationCount++;
            return result;
        } catch (error) {
            this.errorCount++;
            if (this.strict) {
                throw new TranslationError(
                    `Translation failed: ${error.message}`,
                    'TRANSLATION_FAILED'
                );
            }
            return message;
        }
    }

    /**
     * Internal translation implementation
     */
    _doTranslate(message) {
        throw new Error('_doTranslate must be implemented by subclass');
    }

    /**
     * Get translator statistics
     */
    getStats() {
        return {
            sourceFormat: this.sourceFormat,
            targetFormat: this.targetFormat,
            translationCount: this.translationCount,
            errorCount: this.errorCount
        };
    }
}

/**
 * JSON to XML Translator
 */
class JsonToXmlTranslator extends MessageTranslator {
    constructor(options = {}) {
        super({ ...options, sourceFormat: 'json', targetFormat: 'xml' });
        this.rootElement = options.rootElement || 'root';
    }

    _doTranslate(message) {
        const payload = message.getPayload ? message.getPayload() : message;
        const xml = this._convertToXml(payload, this.rootElement);

        if (message.getPayload) {
            const newMessage = message.clone ? message.clone() : { ...message };
            if (newMessage.setHeader) {
                newMessage.setHeader('contentType', 'application/xml');
            }
            return { ...newMessage, payload: xml };
        }

        return xml;
    }

    _convertToXml(obj, rootName) {
        let xml = `<${rootName}>`;

        for (const [key, value] of Object.entries(obj)) {
            if (value === null || value === undefined) {
                xml += `<${key}/>`;
            } else if (typeof value === 'object' && !Array.isArray(value)) {
                xml += this._convertToXml(value, key);
            } else if (Array.isArray(value)) {
                value.forEach(item => {
                    xml += `<${key}>${this._escapeXml(String(item))}</${key}>`;
                });
            } else {
                xml += `<${key}>${this._escapeXml(String(value))}</${key}>`;
            }
        }

        xml += `</${rootName}>`;
        return xml;
    }

    _escapeXml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}

/**
 * Field Mapper Translator
 */
class FieldMapperTranslator extends MessageTranslator {
    constructor(fieldMappings, options = {}) {
        super(options);
        this.fieldMappings = fieldMappings;
        this.defaultValues = options.defaultValues || {};
    }

    _doTranslate(message) {
        const sourcePayload = message.getPayload ? message.getPayload() : message;
        const targetPayload = {};

        for (const [targetField, sourceField] of Object.entries(this.fieldMappings)) {
            if (typeof sourceField === 'function') {
                targetPayload[targetField] = sourceField(sourcePayload);
            } else {
                const value = this._getNestedValue(sourcePayload, sourceField);
                targetPayload[targetField] = value !== undefined
                    ? value
                    : this.defaultValues[targetField];
            }
        }

        if (message.getPayload) {
            const newMessage = message.clone ? message.clone() : { ...message };
            return { ...newMessage, payload: targetPayload };
        }

        return targetPayload;
    }

    _getNestedValue(obj, path) {
        return path.split('.').reduce((current, prop) => {
            return current ? current[prop] : undefined;
        }, obj);
    }
}

/**
 * Normalization Translator
 */
class NormalizationTranslator extends MessageTranslator {
    constructor(schema, options = {}) {
        super(options);
        this.schema = schema;
        this.removeUnknownFields = options.removeUnknownFields !== false;
    }

    _doTranslate(message) {
        const sourcePayload = message.getPayload ? message.getPayload() : message;
        const normalizedPayload = {};

        for (const [field, config] of Object.entries(this.schema)) {
            let value = sourcePayload[field];

            if (value === undefined && config.default !== undefined) {
                value = config.default;
            }

            if (value === undefined && config.required) {
                throw new TranslationError(
                    `Required field ${field} is missing`,
                    'REQUIRED_FIELD_MISSING'
                );
            }

            if (value !== undefined) {
                if (config.type) {
                    value = this._convertType(value, config.type);
                }

                if (config.transform) {
                    value = config.transform(value);
                }

                normalizedPayload[field] = value;
            }
        }

        if (!this.removeUnknownFields) {
            for (const [field, value] of Object.entries(sourcePayload)) {
                if (!this.schema[field]) {
                    normalizedPayload[field] = value;
                }
            }
        }

        if (message.getPayload) {
            const newMessage = message.clone ? message.clone() : { ...message };
            return { ...newMessage, payload: normalizedPayload };
        }

        return normalizedPayload;
    }

    _convertType(value, type) {
        switch (type) {
            case 'string':
                return String(value);
            case 'number':
                return Number(value);
            case 'boolean':
                return Boolean(value);
            case 'date':
                return new Date(value);
            default:
                return value;
        }
    }
}

/**
 * Translation Chain
 */
class TranslationChain {
    constructor() {
        this.translators = [];
    }

    /**
     * Add translator to chain
     */
    addTranslator(translator) {
        this.translators.push(translator);
        return this;
    }

    /**
     * Remove translator from chain
     */
    removeTranslator(translator) {
        const index = this.translators.indexOf(translator);
        if (index > -1) {
            this.translators.splice(index, 1);
        }
        return this;
    }

    /**
     * Translate message through chain
     */
    translate(message) {
        let result = message;

        for (const translator of this.translators) {
            result = translator.translate(result);
        }

        return result;
    }

    /**
     * Get chain statistics
     */
    getStats() {
        return this.translators.map(t => t.getStats());
    }
}

/**
 * Envelope Translator
 */
class EnvelopeTranslator extends MessageTranslator {
    constructor(options = {}) {
        super(options);
        this.envelopeFields = options.envelopeFields || {};
    }

    _doTranslate(message) {
        const payload = message.getPayload ? message.getPayload() : message;

        const envelope = {
            ...this.envelopeFields,
            timestamp: Date.now(),
            body: payload
        };

        if (message.getHeaders) {
            envelope.headers = message.getHeaders();
        }

        if (message.getId) {
            envelope.messageId = message.getId();
        }

        return envelope;
    }
}

/**
 * Content Type Translator
 */
class ContentTypeTranslator extends MessageTranslator {
    constructor(sourceType, targetType, converter) {
        super({ sourceFormat: sourceType, targetFormat: targetType });
        this.converter = converter;
    }

    _doTranslate(message) {
        const payload = message.getPayload ? message.getPayload() : message;
        const convertedPayload = this.converter(payload);

        if (message.getPayload) {
            const newMessage = message.clone ? message.clone() : { ...message };
            if (newMessage.setHeader) {
                newMessage.setHeader('contentType', this.targetFormat);
            }
            return { ...newMessage, payload: convertedPayload };
        }

        return convertedPayload;
    }
}

/**
 * Example Usage and Testing
 */
function demonstrateMessageTranslatorPattern() {
    console.log('=== MessageTranslator Pattern Demonstration ===\n');

    // Example 1: Field Mapper Translator
    console.log('1. Field Mapper Translator:');
    const fieldMapper = new FieldMapperTranslator({
        'customer_name': 'name',
        'customer_email': 'email',
        'order_total': 'amount',
        'full_name': (obj) => `${obj.firstName} ${obj.lastName}`
    });

    const sourceMsg = {
        name: 'John Doe',
        email: 'john@example.com',
        amount: 99.99,
        firstName: 'John',
        lastName: 'Doe'
    };

    const translated = fieldMapper.translate(sourceMsg);
    console.log('Translated message:', translated);
    console.log();

    // Example 2: JSON to XML Translator
    console.log('2. JSON to XML Translator:');
    const jsonToXml = new JsonToXmlTranslator({ rootElement: 'order' });
    const jsonMessage = { orderId: '123', items: ['item1', 'item2'], total: 99.99 };
    const xmlResult = jsonToXml.translate(jsonMessage);
    console.log('XML output:', xmlResult);
    console.log();

    // Example 3: Normalization Translator
    console.log('3. Normalization Translator:');
    const normalizer = new NormalizationTranslator({
        id: { type: 'string', required: true },
        amount: { type: 'number', required: true },
        status: { type: 'string', default: 'pending' },
        created: { type: 'date', transform: (v) => new Date(v) }
    });

    const unnormalizedMsg = {
        id: 123,
        amount: '99.99',
        created: '2024-01-01',
        extra: 'field'
    };

    const normalized = normalizer.translate(unnormalizedMsg);
    console.log('Normalized message:', normalized);
    console.log();

    // Example 4: Translation Chain
    console.log('4. Translation Chain:');
    const chain = new TranslationChain();
    chain.addTranslator(normalizer);
    chain.addTranslator(new EnvelopeTranslator({ system: 'order-service' }));

    const chainedResult = chain.translate(unnormalizedMsg);
    console.log('Chain result:', chainedResult);
    console.log();

    // Example 5: Translator Statistics
    console.log('5. Translator Statistics:');
    console.log('Field Mapper Stats:', fieldMapper.getStats());
    console.log('Chain Stats:', chain.getStats());
}

// Export classes
module.exports = {
    MessageTranslator,
    JsonToXmlTranslator,
    FieldMapperTranslator,
    NormalizationTranslator,
    TranslationChain,
    EnvelopeTranslator,
    ContentTypeTranslator,
    TranslationError,
    demonstrateMessageTranslatorPattern
};

// Run demonstration if executed directly
if (require.main === module) {
    demonstrateMessageTranslatorPattern();
}
