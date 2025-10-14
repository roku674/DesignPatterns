/**
 * Gatekeeper Pattern
 *
 * Protects backend services by using a dedicated host instance that acts
 * as a broker between clients and services. The gatekeeper validates and
 * sanitizes requests before forwarding them to trusted backend services.
 *
 * Use Cases:
 * - Protecting backend services from malicious requests
 * - Input validation and sanitization
 * - Request filtering and threat detection
 * - Separating public-facing and internal services
 * - DDoS protection and rate limiting
 * - Security policy enforcement
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Request Validator
 */
class RequestValidator {
  constructor(config = {}) {
    this.rules = [];
    this.maxRequestSize = config.maxRequestSize || 1024 * 1024;
    this.allowedMethods = config.allowedMethods || ['GET', 'POST', 'PUT', 'DELETE'];
    this.requiredHeaders = config.requiredHeaders || [];
  }

  addRule(rule) {
    this.rules.push(rule);
  }

  validate(request) {
    const violations = [];

    if (request.body && JSON.stringify(request.body).length > this.maxRequestSize) {
      violations.push('Request size exceeds maximum allowed');
    }

    if (!this.allowedMethods.includes(request.method)) {
      violations.push(`Method ${request.method} not allowed`);
    }

    this.requiredHeaders.forEach(header => {
      if (!request.headers[header]) {
        violations.push(`Required header ${header} missing`);
      }
    });

    for (const rule of this.rules) {
      const ruleViolation = rule(request);
      if (ruleViolation) {
        violations.push(ruleViolation);
      }
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }
}

/**
 * Request Sanitizer
 */
class RequestSanitizer {
  constructor() {
    this.sanitizers = [];
  }

  addSanitizer(sanitizer) {
    this.sanitizers.push(sanitizer);
  }

  sanitize(request) {
    let sanitized = { ...request };

    for (const sanitizer of this.sanitizers) {
      sanitized = sanitizer(sanitized);
    }

    return sanitized;
  }

  stripHtmlTags(input) {
    if (typeof input !== 'string') {
      return input;
    }
    return input.replace(/<[^>]*>/g, '');
  }

  escapeSqlInjection(input) {
    if (typeof input !== 'string') {
      return input;
    }
    return input.replace(/['";\\]/g, '\\$&');
  }

  sanitizeBody(request) {
    if (!request.body) {
      return request;
    }

    const sanitizedBody = this.deepSanitize(request.body);

    return {
      ...request,
      body: sanitizedBody
    };
  }

  deepSanitize(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepSanitize(item));
    }

    const sanitized = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (typeof value === 'string') {
        sanitized[key] = this.stripHtmlTags(value);
      } else if (typeof value === 'object') {
        sanitized[key] = this.deepSanitize(value);
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }
}

/**
 * Threat Detector
 */
class ThreatDetector {
  constructor() {
    this.patterns = [];
    this.blacklist = new Set();
    this.suspiciousActivity = new Map();
  }

  addPattern(name, regex, severity) {
    this.patterns.push({ name, regex, severity });
  }

  addToBlacklist(identifier) {
    this.blacklist.add(identifier);
  }

  removeFromBlacklist(identifier) {
    this.blacklist.delete(identifier);
  }

  detect(request) {
    const threats = [];

    if (this.blacklist.has(request.clientId)) {
      threats.push({
        type: 'blacklisted',
        severity: 'critical',
        message: 'Client is blacklisted'
      });
    }

    const requestString = JSON.stringify(request);

    for (const pattern of this.patterns) {
      if (pattern.regex.test(requestString)) {
        threats.push({
          type: pattern.name,
          severity: pattern.severity,
          message: `Detected potential threat: ${pattern.name}`
        });
      }
    }

    this.trackSuspiciousActivity(request, threats);

    return threats;
  }

  trackSuspiciousActivity(request, threats) {
    if (threats.length === 0) {
      return;
    }

    const activity = this.suspiciousActivity.get(request.clientId) || {
      count: 0,
      threats: [],
      firstSeen: Date.now()
    };

    activity.count += threats.length;
    activity.threats.push(...threats);
    activity.lastSeen = Date.now();

    this.suspiciousActivity.set(request.clientId, activity);

    if (activity.count > 10) {
      this.addToBlacklist(request.clientId);
    }
  }

  getSuspiciousActivity(clientId) {
    return this.suspiciousActivity.get(clientId);
  }
}

/**
 * Trusted Service Proxy
 */
class TrustedServiceProxy {
  constructor(config) {
    this.serviceUrl = config.serviceUrl;
    this.timeout = config.timeout || 5000;
    this.retries = config.retries || 3;
    this.trustedHeaders = config.trustedHeaders || {};
  }

  async forward(request) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));

    return {
      status: 200,
      data: {
        message: 'Request forwarded to trusted service',
        processed: true
      },
      headers: {
        'X-Forwarded-By': 'Gatekeeper',
        'X-Trust-Level': 'high'
      }
    };
  }

  addTrustedHeader(key, value) {
    this.trustedHeaders[key] = value;
  }

  prepareTrustedRequest(request) {
    return {
      ...request,
      headers: {
        ...request.headers,
        ...this.trustedHeaders,
        'X-Gatekeeper-Verified': 'true',
        'X-Gatekeeper-Timestamp': new Date().toISOString()
      }
    };
  }
}

/**
 * Main Gatekeeper implementation
 */
class Gatekeeper extends EventEmitter {
  constructor(config = {}) {
    super();
    this.validator = new RequestValidator(config.validation || {});
    this.sanitizer = new RequestSanitizer();
    this.threatDetector = new ThreatDetector();
    this.trustedProxy = new TrustedServiceProxy(config.service || {
      serviceUrl: 'http://internal-service.example.com'
    });
    this.metrics = {
      totalRequests: 0,
      validRequests: 0,
      invalidRequests: 0,
      threatsDetected: 0,
      blockedRequests: 0
    };

    this.setupDefaultValidation();
    this.setupDefaultSanitization();
    this.setupDefaultThreatDetection();
  }

  setupDefaultValidation() {
    this.validator.addRule(request => {
      if (request.path && request.path.includes('..')) {
        return 'Path traversal attempt detected';
      }
      return null;
    });

    this.validator.addRule(request => {
      if (request.headers['content-length'] &&
          parseInt(request.headers['content-length']) > 10 * 1024 * 1024) {
        return 'Content length too large';
      }
      return null;
    });
  }

  setupDefaultSanitization() {
    this.sanitizer.addSanitizer(request => {
      return this.sanitizer.sanitizeBody(request);
    });

    this.sanitizer.addSanitizer(request => {
      const sanitizedHeaders = {};
      Object.keys(request.headers || {}).forEach(key => {
        if (!key.toLowerCase().includes('script')) {
          sanitizedHeaders[key] = request.headers[key];
        }
      });
      return { ...request, headers: sanitizedHeaders };
    });
  }

  setupDefaultThreatDetection() {
    this.threatDetector.addPattern(
      'sql-injection',
      /(union|select|insert|update|delete|drop|;|--|\*|xp_)/i,
      'high'
    );

    this.threatDetector.addPattern(
      'xss',
      /<script|javascript:|onerror=|onload=/i,
      'high'
    );

    this.threatDetector.addPattern(
      'command-injection',
      /(\||&|;|\$\(|\`)/,
      'critical'
    );
  }

  async processRequest(request) {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      this.emit('request:received', request);

      const validation = this.validator.validate(request);

      if (!validation.valid) {
        this.metrics.invalidRequests++;
        this.emit('request:invalid', { request, violations: validation.violations });
        throw new Error(`Invalid request: ${validation.violations.join(', ')}`);
      }

      const threats = this.threatDetector.detect(request);

      if (threats.length > 0) {
        this.metrics.threatsDetected += threats.length;

        const criticalThreats = threats.filter(t => t.severity === 'critical');
        if (criticalThreats.length > 0) {
          this.metrics.blockedRequests++;
          this.emit('threat:detected', { request, threats });
          throw new Error(`Security threat detected: ${criticalThreats[0].message}`);
        }

        this.emit('threat:warning', { request, threats });
      }

      const sanitized = this.sanitizer.sanitize(request);
      this.emit('request:sanitized', sanitized);

      const trustedRequest = this.trustedProxy.prepareTrustedRequest(sanitized);

      const response = await this.trustedProxy.forward(trustedRequest);

      const duration = Date.now() - startTime;
      this.metrics.validRequests++;

      this.emit('request:completed', {
        request,
        response,
        duration,
        threats: threats.filter(t => t.severity !== 'critical')
      });

      return {
        success: true,
        response,
        metadata: {
          duration,
          threats: threats.length,
          sanitized: true
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      this.emit('request:rejected', {
        request,
        error: error.message,
        duration
      });

      throw error;
    }
  }

  addValidationRule(rule) {
    this.validator.addRule(rule);
  }

  addSanitizer(sanitizer) {
    this.sanitizer.addSanitizer(sanitizer);
  }

  addThreatPattern(name, regex, severity) {
    this.threatDetector.addPattern(name, regex, severity);
  }

  blacklistClient(clientId) {
    this.threatDetector.addToBlacklist(clientId);
    this.emit('client:blacklisted', { clientId });
  }

  whitelistClient(clientId) {
    this.threatDetector.removeFromBlacklist(clientId);
    this.emit('client:whitelisted', { clientId });
  }

  getMetrics() {
    return {
      ...this.metrics,
      validationRate: this.metrics.totalRequests > 0
        ? ((this.metrics.validRequests / this.metrics.totalRequests) * 100).toFixed(2) + '%'
        : '0%',
      threatRate: this.metrics.totalRequests > 0
        ? ((this.metrics.threatsDetected / this.metrics.totalRequests) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  getSuspiciousActivity(clientId) {
    return this.threatDetector.getSuspiciousActivity(clientId);
  }
}

/**
 * Example usage and demonstration
 */
function demonstrateGatekeeper() {
  console.log('=== Gatekeeper Pattern Demo ===\n');

  const gatekeeper = new Gatekeeper({
    validation: {
      maxRequestSize: 1024 * 1024,
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
      requiredHeaders: ['content-type']
    },
    service: {
      serviceUrl: 'http://internal-api.example.com',
      timeout: 5000
    }
  });

  gatekeeper.on('request:received', req => {
    console.log(`Processing request: ${req.method} ${req.path}`);
  });

  gatekeeper.on('threat:detected', ({ request, threats }) => {
    console.log(`Critical threat detected for client ${request.clientId}`);
    threats.forEach(threat => {
      console.log(`  - ${threat.type} (${threat.severity}): ${threat.message}`);
    });
  });

  gatekeeper.on('request:completed', ({ duration, threats }) => {
    console.log(`Request completed in ${duration}ms (${threats} warnings)`);
  });

  gatekeeper.on('request:rejected', ({ error }) => {
    console.log(`Request rejected: ${error}`);
  });

  const validRequest = {
    method: 'POST',
    path: '/api/users',
    clientId: 'client-123',
    headers: {
      'content-type': 'application/json',
      'authorization': 'Bearer token123'
    },
    body: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  };

  const maliciousRequest = {
    method: 'POST',
    path: '/api/users',
    clientId: 'client-456',
    headers: {
      'content-type': 'application/json'
    },
    body: {
      name: '<script>alert("xss")</script>',
      email: 'john@example.com'
    }
  };

  Promise.all([
    gatekeeper.processRequest(validRequest).catch(e => ({ error: e.message })),
    gatekeeper.processRequest(maliciousRequest).catch(e => ({ error: e.message }))
  ]).then(results => {
    console.log('\nValid Request Result:');
    console.log(JSON.stringify(results[0], null, 2));

    console.log('\nMalicious Request Result:');
    console.log(JSON.stringify(results[1], null, 2));

    console.log('\nGatekeeper Metrics:');
    console.log(JSON.stringify(gatekeeper.getMetrics(), null, 2));
  });
}

if (require.main === module) {
  demonstrateGatekeeper();
}

module.exports = Gatekeeper;
