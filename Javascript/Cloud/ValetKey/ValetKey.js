/**
 * Valet Key Pattern
 *
 * Provides clients with a restricted token or key that grants direct access
 * to specific resources, eliminating the need to proxy all requests through
 * the application. Commonly used for cloud storage access.
 *
 * Use Cases:
 * - Direct file uploads to cloud storage (S3, Azure Blob, GCS)
 * - Temporary access to specific resources
 * - Reducing server load by offloading data transfer
 * - Secure sharing of private resources
 * - Pre-signed URLs for downloads
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Access Token Generator
 */
class TokenGenerator {
  constructor(config = {}) {
    this.secretKey = config.secretKey || crypto.randomBytes(32).toString('hex');
    this.algorithm = config.algorithm || 'sha256';
  }

  generateToken(resource, permissions, expiresAt) {
    const payload = {
      resource,
      permissions,
      expiresAt,
      issuedAt: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex')
    };

    const signature = this.sign(payload);

    return {
      token: Buffer.from(JSON.stringify(payload)).toString('base64'),
      signature
    };
  }

  sign(payload) {
    const data = JSON.stringify(payload);
    return crypto
      .createHmac(this.algorithm, this.secretKey)
      .update(data)
      .digest('hex');
  }

  verify(token, signature) {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));

      const computedSignature = this.sign(payload);

      if (computedSignature !== signature) {
        return { valid: false, reason: 'Invalid signature' };
      }

      if (Date.now() > payload.expiresAt) {
        return { valid: false, reason: 'Token expired' };
      }

      return {
        valid: true,
        payload
      };
    } catch (error) {
      return { valid: false, reason: 'Invalid token format' };
    }
  }
}

/**
 * Resource Permissions Manager
 */
class PermissionsManager {
  constructor() {
    this.permissions = ['read', 'write', 'delete', 'list'];
  }

  validatePermissions(requested) {
    return requested.every(perm => this.permissions.includes(perm));
  }

  hasPermission(grantedPermissions, required) {
    return grantedPermissions.includes(required);
  }

  restrictPermissions(permissions, maxPermissions) {
    return permissions.filter(p => maxPermissions.includes(p));
  }
}

/**
 * Pre-signed URL Generator
 */
class PreSignedUrlGenerator {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.secretKey = config.secretKey;
  }

  generate(resource, options = {}) {
    const expiresAt = options.expiresAt || (Date.now() + 3600000);
    const permissions = options.permissions || ['read'];
    const contentType = options.contentType;

    const params = new URLSearchParams({
      resource,
      permissions: permissions.join(','),
      expires: expiresAt.toString()
    });

    if (contentType) {
      params.append('content-type', contentType);
    }

    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(`${resource}:${expiresAt}`)
      .digest('hex');

    params.append('signature', signature);

    return `${this.baseUrl}/${resource}?${params.toString()}`;
  }

  verify(url) {
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;

      const resource = params.get('resource');
      const expiresAt = parseInt(params.get('expires'));
      const providedSignature = params.get('signature');

      if (Date.now() > expiresAt) {
        return { valid: false, reason: 'URL expired' };
      }

      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(`${resource}:${expiresAt}`)
        .digest('hex');

      if (providedSignature !== expectedSignature) {
        return { valid: false, reason: 'Invalid signature' };
      }

      return {
        valid: true,
        resource,
        permissions: params.get('permissions').split(','),
        expiresAt
      };
    } catch (error) {
      return { valid: false, reason: 'Invalid URL format' };
    }
  }
}

/**
 * Storage Access Manager
 */
class StorageAccessManager {
  constructor() {
    this.storage = new Map();
    this.accessLog = [];
  }

  async store(resource, data) {
    this.storage.set(resource, {
      data,
      createdAt: Date.now(),
      size: JSON.stringify(data).length
    });

    this.logAccess(resource, 'write', true);

    return {
      success: true,
      resource,
      size: JSON.stringify(data).length
    };
  }

  async retrieve(resource) {
    const item = this.storage.get(resource);

    if (!item) {
      this.logAccess(resource, 'read', false);
      throw new Error('Resource not found');
    }

    this.logAccess(resource, 'read', true);

    return item.data;
  }

  async delete(resource) {
    const exists = this.storage.has(resource);

    if (!exists) {
      this.logAccess(resource, 'delete', false);
      throw new Error('Resource not found');
    }

    this.storage.delete(resource);
    this.logAccess(resource, 'delete', true);

    return { success: true };
  }

  async list(prefix = '') {
    const resources = Array.from(this.storage.keys())
      .filter(key => key.startsWith(prefix))
      .map(key => ({
        resource: key,
        size: this.storage.get(key).size,
        createdAt: this.storage.get(key).createdAt
      }));

    this.logAccess(prefix || '*', 'list', true);

    return resources;
  }

  logAccess(resource, operation, success) {
    this.accessLog.push({
      resource,
      operation,
      success,
      timestamp: Date.now()
    });
  }

  getAccessLog(resource) {
    if (resource) {
      return this.accessLog.filter(log => log.resource === resource);
    }
    return this.accessLog;
  }
}

/**
 * Main Valet Key implementation
 */
class ValetKey extends EventEmitter {
  constructor(config = {}) {
    super();
    this.tokenGenerator = new TokenGenerator(config.token || {});
    this.permissionsManager = new PermissionsManager();
    this.urlGenerator = new PreSignedUrlGenerator(config.url || {
      baseUrl: 'https://storage.example.com',
      secretKey: crypto.randomBytes(32).toString('hex')
    });
    this.storageManager = new StorageAccessManager();
    this.activeKeys = new Map();
    this.metrics = {
      keysIssued: 0,
      keysRevoked: 0,
      accessGranted: 0,
      accessDenied: 0
    };
  }

  issueKey(resource, permissions, options = {}) {
    const duration = options.duration || 3600000;
    const expiresAt = Date.now() + duration;

    if (!this.permissionsManager.validatePermissions(permissions)) {
      throw new Error('Invalid permissions requested');
    }

    const { token, signature } = this.tokenGenerator.generateToken(
      resource,
      permissions,
      expiresAt
    );

    const key = {
      id: crypto.randomUUID(),
      token,
      signature,
      resource,
      permissions,
      expiresAt,
      issuedAt: Date.now(),
      metadata: options.metadata || {}
    };

    this.activeKeys.set(key.id, key);
    this.metrics.keysIssued++;

    this.emit('key:issued', {
      keyId: key.id,
      resource,
      permissions,
      expiresAt
    });

    return {
      keyId: key.id,
      token,
      signature,
      resource,
      permissions,
      expiresAt
    };
  }

  issuePreSignedUrl(resource, options = {}) {
    const url = this.urlGenerator.generate(resource, options);

    this.metrics.keysIssued++;

    this.emit('url:generated', {
      resource,
      url: url.substring(0, 50) + '...'
    });

    return url;
  }

  validateKey(token, signature, requiredPermission) {
    const validation = this.tokenGenerator.verify(token, signature);

    if (!validation.valid) {
      this.metrics.accessDenied++;
      this.emit('access:denied', {
        reason: validation.reason
      });
      throw new Error(`Invalid key: ${validation.reason}`);
    }

    const { payload } = validation;

    if (!this.permissionsManager.hasPermission(payload.permissions, requiredPermission)) {
      this.metrics.accessDenied++;
      this.emit('access:denied', {
        reason: 'Insufficient permissions',
        required: requiredPermission,
        granted: payload.permissions
      });
      throw new Error(`Insufficient permissions: ${requiredPermission} required`);
    }

    this.metrics.accessGranted++;

    return {
      valid: true,
      resource: payload.resource,
      permissions: payload.permissions,
      expiresAt: payload.expiresAt
    };
  }

  async accessResource(token, signature, operation, data = null) {
    try {
      this.validateKey(token, signature, operation);

      const validation = this.tokenGenerator.verify(token, signature);
      const resource = validation.payload.resource;

      let result;

      switch (operation) {
        case 'read':
          result = await this.storageManager.retrieve(resource);
          break;
        case 'write':
          if (!data) {
            throw new Error('Data required for write operation');
          }
          result = await this.storageManager.store(resource, data);
          break;
        case 'delete':
          result = await this.storageManager.delete(resource);
          break;
        case 'list':
          result = await this.storageManager.list(resource);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      this.emit('resource:accessed', {
        resource,
        operation,
        success: true
      });

      return {
        success: true,
        operation,
        resource,
        result
      };
    } catch (error) {
      this.emit('resource:access-failed', {
        operation,
        error: error.message
      });
      throw error;
    }
  }

  revokeKey(keyId) {
    const key = this.activeKeys.get(keyId);

    if (!key) {
      throw new Error('Key not found');
    }

    this.activeKeys.delete(keyId);
    this.metrics.keysRevoked++;

    this.emit('key:revoked', { keyId });

    return { success: true };
  }

  getActiveKeys(resource) {
    const keys = Array.from(this.activeKeys.values());

    if (resource) {
      return keys.filter(key => key.resource === resource);
    }

    return keys;
  }

  cleanExpiredKeys() {
    const now = Date.now();
    let cleaned = 0;

    for (const [keyId, key] of this.activeKeys.entries()) {
      if (now > key.expiresAt) {
        this.activeKeys.delete(keyId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.emit('keys:cleaned', { count: cleaned });
    }

    return cleaned;
  }

  getMetrics() {
    return {
      ...this.metrics,
      activeKeys: this.activeKeys.size,
      accessApprovalRate: (this.metrics.accessGranted + this.metrics.accessDenied) > 0
        ? ((this.metrics.accessGranted / (this.metrics.accessGranted + this.metrics.accessDenied)) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  getAccessLog(resource) {
    return this.storageManager.getAccessLog(resource);
  }
}

/**
 * Example usage and demonstration
 */
function demonstrateValetKey() {
  console.log('=== Valet Key Pattern Demo ===\n');

  const valetKey = new ValetKey({
    token: {
      secretKey: 'my-secret-key'
    },
    url: {
      baseUrl: 'https://storage.example.com',
      secretKey: 'url-secret-key'
    }
  });

  valetKey.on('key:issued', ({ resource, permissions }) => {
    console.log(`Key issued for ${resource} with permissions: ${permissions.join(', ')}`);
  });

  valetKey.on('resource:accessed', ({ resource, operation }) => {
    console.log(`Resource ${resource} accessed for ${operation}`);
  });

  valetKey.on('access:denied', ({ reason }) => {
    console.log(`Access denied: ${reason}`);
  });

  console.log('1. Issuing valet key for upload...');
  const uploadKey = valetKey.issueKey('documents/report.pdf', ['write'], {
    duration: 3600000,
    metadata: { userId: 'user-123', purpose: 'upload' }
  });

  console.log('\n2. Using key to upload document...');
  valetKey.accessResource(
    uploadKey.token,
    uploadKey.signature,
    'write',
    { title: 'Annual Report', content: 'Report data...' }
  ).then(() => {
    console.log('Upload successful!');

    console.log('\n3. Issuing key for download...');
    const downloadKey = valetKey.issueKey('documents/report.pdf', ['read'], {
      duration: 1800000
    });

    console.log('\n4. Using key to download document...');
    return valetKey.accessResource(
      downloadKey.token,
      downloadKey.signature,
      'read'
    );
  }).then(result => {
    console.log('Download successful!');
    console.log('Data:', JSON.stringify(result.result, null, 2));

    console.log('\n5. Generating pre-signed URL...');
    const preSignedUrl = valetKey.issuePreSignedUrl('documents/report.pdf', {
      permissions: ['read'],
      expiresAt: Date.now() + 3600000
    });
    console.log(`Pre-signed URL: ${preSignedUrl.substring(0, 80)}...`);

    console.log('\n6. Attempting access with insufficient permissions...');
    const readOnlyKey = valetKey.issueKey('documents/report.pdf', ['read']);

    return valetKey.accessResource(
      readOnlyKey.token,
      readOnlyKey.signature,
      'delete'
    ).catch(error => {
      console.log(`Expected error: ${error.message}`);
    });
  }).then(() => {
    console.log('\nValet Key Metrics:');
    console.log(JSON.stringify(valetKey.getMetrics(), null, 2));
  }).catch(error => {
    console.error('Error:', error.message);
  });
}

if (require.main === module) {
  demonstrateValetKey();
}

module.exports = ValetKey;
