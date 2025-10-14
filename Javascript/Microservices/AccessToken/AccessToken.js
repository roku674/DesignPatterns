/**
 * Access Token Pattern for Microservices
 *
 * Implements secure token-based authentication and authorization for microservices.
 * Provides JWT token generation, validation, refresh mechanisms, and claims-based
 * access control for distributed systems.
 *
 * Use Cases:
 * - Service-to-service authentication
 * - User session management
 * - API gateway authentication
 * - OAuth2/OIDC implementations
 * - Distributed authorization
 */

const crypto = require('crypto');

/**
 * Token types supported by the system
 */
const TokenType = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  API_KEY: 'api_key',
  SERVICE: 'service'
};

/**
 * Token status enumeration
 */
const TokenStatus = {
  VALID: 'valid',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
  INVALID: 'invalid'
};

/**
 * Access Token Manager
 * Manages token lifecycle including generation, validation, refresh, and revocation
 */
class AccessToken {
  /**
   * Initialize Access Token manager
   * @param {Object} config - Configuration options
   * @param {string} config.secret - Secret key for signing tokens
   * @param {number} config.accessTokenExpiry - Access token expiry in seconds (default: 900)
   * @param {number} config.refreshTokenExpiry - Refresh token expiry in seconds (default: 604800)
   * @param {string} config.algorithm - Signing algorithm (default: 'HS256')
   * @param {string} config.issuer - Token issuer identifier
   * @param {Array<string>} config.audience - Valid token audiences
   */
  constructor(config = {}) {
    if (!config.secret) {
      throw new Error('Secret key is required for token signing');
    }

    this.config = {
      secret: config.secret,
      accessTokenExpiry: config.accessTokenExpiry || 900, // 15 minutes
      refreshTokenExpiry: config.refreshTokenExpiry || 604800, // 7 days
      algorithm: config.algorithm || 'HS256',
      issuer: config.issuer || 'microservice-auth',
      audience: config.audience || ['microservice-api'],
      ...config
    };

    this.tokenStore = new Map(); // In-memory token storage (use Redis in production)
    this.revokedTokens = new Set(); // Revoked token blacklist
    this.refreshTokens = new Map(); // Refresh token mappings
  }

  /**
   * Generate an access token for a user or service
   * @param {Object} payload - Token payload
   * @param {string} payload.sub - Subject (user/service identifier)
   * @param {Array<string>} payload.roles - User/service roles
   * @param {Object} payload.claims - Additional claims
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Token object with access and refresh tokens
   */
  async generateToken(payload, options = {}) {
    try {
      const tokenId = this._generateTokenId();
      const now = Math.floor(Date.now() / 1000);

      const accessTokenPayload = {
        jti: tokenId,
        sub: payload.sub,
        iss: this.config.issuer,
        aud: this.config.audience,
        iat: now,
        exp: now + this.config.accessTokenExpiry,
        type: TokenType.ACCESS,
        roles: payload.roles || [],
        claims: payload.claims || {},
        ...options.additionalClaims
      };

      const accessToken = this._encodeToken(accessTokenPayload);

      // Generate refresh token if requested
      let refreshToken = null;
      if (options.includeRefresh !== false) {
        const refreshTokenId = this._generateTokenId();
        const refreshTokenPayload = {
          jti: refreshTokenId,
          sub: payload.sub,
          iss: this.config.issuer,
          iat: now,
          exp: now + this.config.refreshTokenExpiry,
          type: TokenType.REFRESH,
          accessTokenId: tokenId
        };

        refreshToken = this._encodeToken(refreshTokenPayload);

        // Store refresh token mapping
        this.refreshTokens.set(refreshTokenId, {
          userId: payload.sub,
          accessTokenId: tokenId,
          createdAt: now
        });
      }

      // Store token metadata
      this.tokenStore.set(tokenId, {
        userId: payload.sub,
        type: TokenType.ACCESS,
        createdAt: now,
        expiresAt: now + this.config.accessTokenExpiry,
        roles: payload.roles || [],
        status: TokenStatus.VALID
      });

      return {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: this.config.accessTokenExpiry,
        tokenId
      };

    } catch (error) {
      throw new Error(`Token generation failed: ${error.message}`);
    }
  }

  /**
   * Validate an access token
   * @param {string} token - Token to validate
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation result with decoded payload
   */
  async validateToken(token, options = {}) {
    try {
      const decoded = this._decodeToken(token);

      // Check token type
      if (decoded.type !== TokenType.ACCESS) {
        return {
          valid: false,
          status: TokenStatus.INVALID,
          error: 'Invalid token type'
        };
      }

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        return {
          valid: false,
          status: TokenStatus.EXPIRED,
          error: 'Token has expired'
        };
      }

      // Check if token is revoked
      if (this.revokedTokens.has(decoded.jti)) {
        return {
          valid: false,
          status: TokenStatus.REVOKED,
          error: 'Token has been revoked'
        };
      }

      // Check issuer
      if (decoded.iss !== this.config.issuer) {
        return {
          valid: false,
          status: TokenStatus.INVALID,
          error: 'Invalid token issuer'
        };
      }

      // Check audience if specified
      if (options.audience) {
        const audiences = Array.isArray(decoded.aud) ? decoded.aud : [decoded.aud];
        if (!audiences.includes(options.audience)) {
          return {
            valid: false,
            status: TokenStatus.INVALID,
            error: 'Invalid token audience'
          };
        }
      }

      // Check required roles if specified
      if (options.requiredRoles) {
        const hasRequiredRoles = options.requiredRoles.every(role =>
          decoded.roles.includes(role)
        );
        if (!hasRequiredRoles) {
          return {
            valid: false,
            status: TokenStatus.INVALID,
            error: 'Insufficient permissions'
          };
        }
      }

      return {
        valid: true,
        status: TokenStatus.VALID,
        payload: decoded,
        userId: decoded.sub,
        roles: decoded.roles,
        claims: decoded.claims
      };

    } catch (error) {
      return {
        valid: false,
        status: TokenStatus.INVALID,
        error: error.message
      };
    }
  }

  /**
   * Refresh an access token using a refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const decoded = this._decodeToken(refreshToken);

      // Verify it's a refresh token
      if (decoded.type !== TokenType.REFRESH) {
        throw new Error('Invalid refresh token type');
      }

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        throw new Error('Refresh token has expired');
      }

      // Check if refresh token exists in storage
      const refreshData = this.refreshTokens.get(decoded.jti);
      if (!refreshData) {
        throw new Error('Refresh token not found or has been revoked');
      }

      // Get original token data
      const originalToken = this.tokenStore.get(refreshData.accessTokenId);
      if (!originalToken) {
        throw new Error('Original token data not found');
      }

      // Generate new access token
      const newToken = await this.generateToken({
        sub: refreshData.userId,
        roles: originalToken.roles,
        claims: {}
      }, { includeRefresh: false });

      return newToken;

    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  /**
   * Revoke a token (add to blacklist)
   * @param {string} token - Token to revoke
   * @returns {Promise<boolean>} Revocation success
   */
  async revokeToken(token) {
    try {
      const decoded = this._decodeToken(token);
      this.revokedTokens.add(decoded.jti);

      // Update token status in storage
      const tokenData = this.tokenStore.get(decoded.jti);
      if (tokenData) {
        tokenData.status = TokenStatus.REVOKED;
      }

      // If it's an access token, revoke associated refresh tokens
      if (decoded.type === TokenType.ACCESS) {
        for (const [refreshId, refreshData] of this.refreshTokens.entries()) {
          if (refreshData.accessTokenId === decoded.jti) {
            this.refreshTokens.delete(refreshId);
          }
        }
      }

      return true;

    } catch (error) {
      throw new Error(`Token revocation failed: ${error.message}`);
    }
  }

  /**
   * Revoke all tokens for a user
   * @param {string} userId - User identifier
   * @returns {Promise<number>} Number of tokens revoked
   */
  async revokeUserTokens(userId) {
    let count = 0;

    for (const [tokenId, tokenData] of this.tokenStore.entries()) {
      if (tokenData.userId === userId && tokenData.status !== TokenStatus.REVOKED) {
        this.revokedTokens.add(tokenId);
        tokenData.status = TokenStatus.REVOKED;
        count++;
      }
    }

    // Revoke refresh tokens
    for (const [refreshId, refreshData] of this.refreshTokens.entries()) {
      if (refreshData.userId === userId) {
        this.refreshTokens.delete(refreshId);
      }
    }

    return count;
  }

  /**
   * Generate API key for service-to-service communication
   * @param {Object} serviceInfo - Service information
   * @returns {Promise<string>} API key
   */
  async generateApiKey(serviceInfo) {
    const tokenId = this._generateTokenId();
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      jti: tokenId,
      sub: serviceInfo.serviceId,
      iss: this.config.issuer,
      iat: now,
      type: TokenType.API_KEY,
      serviceName: serviceInfo.serviceName,
      permissions: serviceInfo.permissions || []
    };

    const apiKey = this._encodeToken(payload);

    this.tokenStore.set(tokenId, {
      serviceId: serviceInfo.serviceId,
      type: TokenType.API_KEY,
      createdAt: now,
      permissions: serviceInfo.permissions || [],
      status: TokenStatus.VALID
    });

    return apiKey;
  }

  /**
   * Clean up expired tokens from storage
   * @returns {Promise<number>} Number of tokens cleaned up
   */
  async cleanupExpiredTokens() {
    const now = Math.floor(Date.now() / 1000);
    let count = 0;

    for (const [tokenId, tokenData] of this.tokenStore.entries()) {
      if (tokenData.expiresAt && tokenData.expiresAt < now) {
        this.tokenStore.delete(tokenId);
        this.revokedTokens.delete(tokenId);
        count++;
      }
    }

    // Cleanup expired refresh tokens
    for (const [refreshId, refreshData] of this.refreshTokens.entries()) {
      const tokenData = this.tokenStore.get(refreshData.accessTokenId);
      if (!tokenData) {
        this.refreshTokens.delete(refreshId);
        count++;
      }
    }

    return count;
  }

  /**
   * Get token statistics
   * @returns {Object} Token statistics
   */
  getTokenStats() {
    let active = 0;
    let expired = 0;
    let revoked = 0;
    const now = Math.floor(Date.now() / 1000);

    for (const tokenData of this.tokenStore.values()) {
      if (tokenData.status === TokenStatus.REVOKED) {
        revoked++;
      } else if (tokenData.expiresAt && tokenData.expiresAt < now) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.tokenStore.size,
      active,
      expired,
      revoked,
      refreshTokens: this.refreshTokens.size
    };
  }

  /**
   * Generate unique token ID
   * @private
   */
  _generateTokenId() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Encode token payload
   * @private
   */
  _encodeToken(payload) {
    const header = {
      alg: this.config.algorithm,
      typ: 'JWT'
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

    const signature = crypto
      .createHmac('sha256', this.config.secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Decode and verify token
   * @private
   */
  _decodeToken(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', this.config.secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      throw new Error('Invalid token signature');
    }

    // Decode payload
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    return payload;
  }
}

module.exports = AccessToken;
module.exports.TokenType = TokenType;
module.exports.TokenStatus = TokenStatus;
