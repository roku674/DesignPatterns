/**
 * Federated Identity Pattern
 *
 * Delegates authentication to an external identity provider, allowing users
 * to access multiple applications with a single set of credentials.
 *
 * Use Cases:
 * - Single Sign-On (SSO) across multiple applications
 * - Social login (Google, Facebook, GitHub, etc.)
 * - Enterprise identity federation (SAML, OAuth, OpenID Connect)
 * - Multi-tenant applications with external identity providers
 * - Cross-domain authentication
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Identity Provider configuration
 */
class IdentityProvider {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.authorizationEndpoint = config.authorizationEndpoint;
    this.tokenEndpoint = config.tokenEndpoint;
    this.userInfoEndpoint = config.userInfoEndpoint;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.scopes = config.scopes || ['openid', 'profile', 'email'];
    this.callbackUrl = config.callbackUrl;
  }

  generateAuthorizationUrl(state) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      scope: this.scopes.join(' '),
      state
    });

    return `${this.authorizationEndpoint}?${params.toString()}`;
  }
}

/**
 * OAuth Token Manager
 */
class TokenManager {
  constructor() {
    this.tokens = new Map();
  }

  async exchangeCodeForToken(provider, code) {
    await new Promise(resolve => setTimeout(resolve, 100));

    const accessToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (3600 * 1000);

    const tokenData = {
      accessToken,
      refreshToken,
      expiresAt,
      provider: provider.id,
      scopes: provider.scopes
    };

    this.tokens.set(accessToken, tokenData);

    return tokenData;
  }

  async refreshAccessToken(refreshToken) {
    await new Promise(resolve => setTimeout(resolve, 50));

    const newAccessToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (3600 * 1000);

    const tokenData = {
      accessToken: newAccessToken,
      refreshToken,
      expiresAt
    };

    this.tokens.set(newAccessToken, tokenData);

    return tokenData;
  }

  validateToken(accessToken) {
    const tokenData = this.tokens.get(accessToken);

    if (!tokenData) {
      return { valid: false, reason: 'Token not found' };
    }

    if (Date.now() > tokenData.expiresAt) {
      return { valid: false, reason: 'Token expired' };
    }

    return { valid: true, tokenData };
  }

  revokeToken(accessToken) {
    return this.tokens.delete(accessToken);
  }
}

/**
 * User Profile Manager
 */
class ProfileManager {
  constructor() {
    this.profiles = new Map();
  }

  async fetchUserProfile(provider, accessToken) {
    await new Promise(resolve => setTimeout(resolve, 50));

    const mockProfile = {
      id: crypto.randomUUID(),
      email: 'user@example.com',
      name: 'John Doe',
      picture: 'https://example.com/avatar.jpg',
      provider: provider.id,
      verified: true,
      locale: 'en',
      createdAt: new Date().toISOString()
    };

    this.profiles.set(accessToken, mockProfile);

    return mockProfile;
  }

  getProfile(accessToken) {
    return this.profiles.get(accessToken);
  }

  updateProfile(accessToken, updates) {
    const profile = this.profiles.get(accessToken);

    if (!profile) {
      throw new Error('Profile not found');
    }

    const updated = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.profiles.set(accessToken, updated);

    return updated;
  }

  deleteProfile(accessToken) {
    return this.profiles.delete(accessToken);
  }
}

/**
 * Session Manager for federated sessions
 */
class SessionManager {
  constructor(config = {}) {
    this.sessions = new Map();
    this.sessionTimeout = config.sessionTimeout || 3600000;
    this.cleanupInterval = config.cleanupInterval || 300000;
    this.startCleanup();
  }

  createSession(userId, provider, tokenData, profile) {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + this.sessionTimeout;

    const session = {
      sessionId,
      userId,
      provider,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      profile,
      createdAt: Date.now(),
      expiresAt,
      lastActivity: Date.now()
    };

    this.sessions.set(sessionId, session);

    return session;
  }

  getSession(sessionId) {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }

    session.lastActivity = Date.now();
    return session;
  }

  updateSession(sessionId, updates) {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    const updated = {
      ...session,
      ...updates,
      lastActivity: Date.now()
    };

    this.sessions.set(sessionId, updated);

    return updated;
  }

  destroySession(sessionId) {
    return this.sessions.delete(sessionId);
  }

  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [sessionId, session] of this.sessions.entries()) {
        if (now > session.expiresAt) {
          this.sessions.delete(sessionId);
        }
      }
    }, this.cleanupInterval);
  }
}

/**
 * Authorization State Manager
 */
class StateManager {
  constructor() {
    this.states = new Map();
    this.stateTimeout = 600000;
  }

  generateState(metadata = {}) {
    const state = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + this.stateTimeout;

    this.states.set(state, {
      metadata,
      createdAt: Date.now(),
      expiresAt
    });

    return state;
  }

  validateState(state) {
    const stateData = this.states.get(state);

    if (!stateData) {
      return { valid: false, reason: 'State not found' };
    }

    if (Date.now() > stateData.expiresAt) {
      this.states.delete(state);
      return { valid: false, reason: 'State expired' };
    }

    this.states.delete(state);

    return {
      valid: true,
      metadata: stateData.metadata
    };
  }
}

/**
 * Main Federated Identity implementation
 */
class FederatedIdentity extends EventEmitter {
  constructor(config = {}) {
    super();
    this.providers = new Map();
    this.tokenManager = new TokenManager();
    this.profileManager = new ProfileManager();
    this.sessionManager = new SessionManager(config.session || {});
    this.stateManager = new StateManager();
    this.metrics = {
      totalLogins: 0,
      successfulLogins: 0,
      failedLogins: 0,
      activeSession: 0,
      loginsByProvider: {}
    };
  }

  registerProvider(config) {
    const provider = new IdentityProvider(config);
    this.providers.set(provider.id, provider);
    this.emit('provider:registered', { providerId: provider.id });
    return provider;
  }

  getProvider(providerId) {
    const provider = this.providers.get(providerId);

    if (!provider) {
      throw new Error(`Identity provider ${providerId} not found`);
    }

    return provider;
  }

  initiateLogin(providerId, metadata = {}) {
    this.metrics.totalLogins++;

    if (!this.metrics.loginsByProvider[providerId]) {
      this.metrics.loginsByProvider[providerId] = 0;
    }

    this.metrics.loginsByProvider[providerId]++;

    const provider = this.getProvider(providerId);
    const state = this.stateManager.generateState(metadata);
    const authUrl = provider.generateAuthorizationUrl(state);

    this.emit('login:initiated', {
      provider: providerId,
      state,
      authUrl
    });

    return {
      authUrl,
      state,
      provider: provider.name
    };
  }

  async handleCallback(providerId, code, state) {
    try {
      const stateValidation = this.stateManager.validateState(state);

      if (!stateValidation.valid) {
        this.metrics.failedLogins++;
        throw new Error(`Invalid state: ${stateValidation.reason}`);
      }

      const provider = this.getProvider(providerId);

      this.emit('callback:received', { provider: providerId, code });

      const tokenData = await this.tokenManager.exchangeCodeForToken(provider, code);

      this.emit('token:exchanged', { provider: providerId });

      const profile = await this.profileManager.fetchUserProfile(provider, tokenData.accessToken);

      this.emit('profile:fetched', { provider: providerId, userId: profile.id });

      const session = this.sessionManager.createSession(
        profile.id,
        providerId,
        tokenData,
        profile
      );

      this.metrics.successfulLogins++;
      this.metrics.activeSession++;

      this.emit('login:completed', {
        sessionId: session.sessionId,
        userId: profile.id,
        provider: providerId
      });

      return {
        success: true,
        sessionId: session.sessionId,
        user: profile,
        expiresAt: session.expiresAt
      };
    } catch (error) {
      this.metrics.failedLogins++;

      this.emit('login:failed', {
        provider: providerId,
        error: error.message
      });

      throw error;
    }
  }

  validateSession(sessionId) {
    const session = this.sessionManager.getSession(sessionId);

    if (!session) {
      return { valid: false, reason: 'Session not found or expired' };
    }

    const tokenValidation = this.tokenManager.validateToken(session.accessToken);

    if (!tokenValidation.valid) {
      return { valid: false, reason: tokenValidation.reason };
    }

    return {
      valid: true,
      session,
      user: session.profile
    };
  }

  async refreshSession(sessionId) {
    const session = this.sessionManager.getSession(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    const newTokenData = await this.tokenManager.refreshAccessToken(session.refreshToken);

    this.sessionManager.updateSession(sessionId, {
      accessToken: newTokenData.accessToken,
      expiresAt: Date.now() + this.sessionManager.sessionTimeout
    });

    this.emit('session:refreshed', { sessionId });

    return newTokenData;
  }

  logout(sessionId) {
    const session = this.sessionManager.getSession(sessionId);

    if (session) {
      this.tokenManager.revokeToken(session.accessToken);
      this.profileManager.deleteProfile(session.accessToken);
      this.sessionManager.destroySession(sessionId);
      this.metrics.activeSessions = Math.max(0, this.metrics.activeSessions - 1);

      this.emit('logout:completed', {
        sessionId,
        userId: session.userId
      });
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      loginSuccessRate: this.metrics.totalLogins > 0
        ? ((this.metrics.successfulLogins / this.metrics.totalLogins) * 100).toFixed(2) + '%'
        : '0%',
      providers: Array.from(this.providers.keys())
    };
  }
}

/**
 * Example usage and demonstration
 */
function demonstrateFederatedIdentity() {
  console.log('=== Federated Identity Pattern Demo ===\n');

  const federation = new FederatedIdentity({
    session: {
      sessionTimeout: 3600000,
      cleanupInterval: 300000
    }
  });

  federation.registerProvider({
    id: 'google',
    name: 'Google',
    type: 'oauth2',
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    userInfoEndpoint: 'https://www.googleapis.com/oauth2/v1/userinfo',
    clientId: 'google-client-id',
    clientSecret: 'google-client-secret',
    scopes: ['openid', 'profile', 'email'],
    callbackUrl: 'https://myapp.com/auth/google/callback'
  });

  federation.registerProvider({
    id: 'github',
    name: 'GitHub',
    type: 'oauth2',
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    userInfoEndpoint: 'https://api.github.com/user',
    clientId: 'github-client-id',
    clientSecret: 'github-client-secret',
    scopes: ['read:user', 'user:email'],
    callbackUrl: 'https://myapp.com/auth/github/callback'
  });

  federation.on('login:initiated', ({ provider, authUrl }) => {
    console.log(`Login initiated with ${provider}`);
    console.log(`Redirect to: ${authUrl.substring(0, 50)}...`);
  });

  federation.on('login:completed', ({ sessionId, userId, provider }) => {
    console.log(`Login completed for user ${userId} via ${provider}`);
    console.log(`Session: ${sessionId.substring(0, 16)}...`);
  });

  const loginRequest = federation.initiateLogin('google', {
    returnUrl: '/dashboard'
  });

  console.log('\nLogin Request:');
  console.log(`  Provider: ${loginRequest.provider}`);
  console.log(`  Auth URL: ${loginRequest.authUrl.substring(0, 50)}...`);

  const mockAuthCode = 'authorization-code-123';

  federation.handleCallback('google', mockAuthCode, loginRequest.state)
    .then(result => {
      console.log('\nLogin Result:');
      console.log(JSON.stringify(result, null, 2));

      const validation = federation.validateSession(result.sessionId);
      console.log('\nSession Validation:');
      console.log(`  Valid: ${validation.valid}`);
      console.log(`  User: ${validation.user?.name}`);

      console.log('\nFederation Metrics:');
      console.log(JSON.stringify(federation.getMetrics(), null, 2));

      federation.logout(result.sessionId);
      console.log('\nUser logged out successfully');
    })
    .catch(error => {
      console.error('Login failed:', error.message);
    });
}

if (require.main === module) {
  demonstrateFederatedIdentity();
}

module.exports = FederatedIdentity;
