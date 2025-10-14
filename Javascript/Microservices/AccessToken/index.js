/**
 * Access Token Pattern - Usage Examples
 *
 * Demonstrates secure token-based authentication and authorization
 * for microservices architecture.
 */

const AccessToken = require('./AccessToken');
const { TokenType, TokenStatus } = require('./AccessToken');

/**
 * Example 1: Basic Token Generation and Validation
 */
async function example1_BasicTokenManagement() {
  console.log('\n=== Example 1: Basic Token Management ===\n');

  const tokenManager = new AccessToken({
    secret: 'super-secret-key-change-in-production',
    accessTokenExpiry: 900, // 15 minutes
    refreshTokenExpiry: 604800, // 7 days
    issuer: 'auth-service',
    audience: ['api-gateway', 'user-service']
  });

  // Generate token for user
  const tokens = await tokenManager.generateToken({
    sub: 'user-123',
    roles: ['user', 'premium'],
    claims: {
      email: 'user@example.com',
      subscription: 'premium'
    }
  });

  console.log('Generated Tokens:', {
    accessToken: tokens.accessToken.substring(0, 50) + '...',
    refreshToken: tokens.refreshToken.substring(0, 50) + '...',
    expiresIn: tokens.expiresIn,
    tokenId: tokens.tokenId
  });

  // Validate the access token
  const validation = await tokenManager.validateToken(tokens.accessToken);
  console.log('\nValidation Result:', {
    valid: validation.valid,
    userId: validation.userId,
    roles: validation.roles
  });
}

/**
 * Example 2: Token Refresh Flow
 */
async function example2_TokenRefresh() {
  console.log('\n=== Example 2: Token Refresh Flow ===\n');

  const tokenManager = new AccessToken({
    secret: 'super-secret-key-change-in-production',
    accessTokenExpiry: 60, // 1 minute (short for demo)
    refreshTokenExpiry: 3600 // 1 hour
  });

  // Generate initial tokens
  const initialTokens = await tokenManager.generateToken({
    sub: 'user-456',
    roles: ['user', 'admin']
  });

  console.log('Initial Access Token Generated');

  // Simulate token expiration and refresh
  console.log('\nRefreshing access token...');
  const newTokens = await tokenManager.refreshAccessToken(initialTokens.refreshToken);

  console.log('New Access Token:', {
    accessToken: newTokens.accessToken.substring(0, 50) + '...',
    expiresIn: newTokens.expiresIn
  });

  // Validate new token
  const validation = await tokenManager.validateToken(newTokens.accessToken);
  console.log('New Token Valid:', validation.valid);
}

/**
 * Example 3: Role-Based Access Control
 */
async function example3_RoleBasedAccess() {
  console.log('\n=== Example 3: Role-Based Access Control ===\n');

  const tokenManager = new AccessToken({
    secret: 'super-secret-key-change-in-production'
  });

  // Generate tokens with different roles
  const adminToken = await tokenManager.generateToken({
    sub: 'admin-001',
    roles: ['admin', 'moderator', 'user'],
    claims: { department: 'IT' }
  });

  const userToken = await tokenManager.generateToken({
    sub: 'user-002',
    roles: ['user'],
    claims: { subscription: 'basic' }
  });

  // Validate with role requirements
  const adminValidation = await tokenManager.validateToken(
    adminToken.accessToken,
    { requiredRoles: ['admin'] }
  );

  const userValidation = await tokenManager.validateToken(
    userToken.accessToken,
    { requiredRoles: ['admin'] }
  );

  console.log('Admin Token (requires admin role):', adminValidation.valid);
  console.log('User Token (requires admin role):', userValidation.valid);
  console.log('User Token Error:', userValidation.error);
}

/**
 * Example 4: Token Revocation
 */
async function example4_TokenRevocation() {
  console.log('\n=== Example 4: Token Revocation ===\n');

  const tokenManager = new AccessToken({
    secret: 'super-secret-key-change-in-production'
  });

  const tokens = await tokenManager.generateToken({
    sub: 'user-789',
    roles: ['user']
  });

  console.log('Token Valid Before Revocation:',
    (await tokenManager.validateToken(tokens.accessToken)).valid
  );

  // Revoke the token
  await tokenManager.revokeToken(tokens.accessToken);
  console.log('Token Revoked');

  const validation = await tokenManager.validateToken(tokens.accessToken);
  console.log('Token Valid After Revocation:', validation.valid);
  console.log('Revocation Status:', validation.status);
}

/**
 * Example 5: API Key Generation for Services
 */
async function example5_ServiceApiKeys() {
  console.log('\n=== Example 5: Service API Keys ===\n');

  const tokenManager = new AccessToken({
    secret: 'super-secret-key-change-in-production'
  });

  // Generate API key for service-to-service communication
  const apiKey = await tokenManager.generateApiKey({
    serviceId: 'payment-service-001',
    serviceName: 'PaymentService',
    permissions: ['process_payment', 'refund', 'query_transactions']
  });

  console.log('Service API Key:', apiKey.substring(0, 50) + '...');

  // Validate service API key
  const validation = await tokenManager.validateToken(apiKey);
  console.log('API Key Valid:', validation.valid);
  console.log('Service Permissions:', validation.payload.permissions);
}

/**
 * Example 6: Multi-Audience Token Validation
 */
async function example6_MultiAudience() {
  console.log('\n=== Example 6: Multi-Audience Validation ===\n');

  const tokenManager = new AccessToken({
    secret: 'super-secret-key-change-in-production',
    audience: ['api-gateway', 'user-service', 'order-service']
  });

  const token = await tokenManager.generateToken({
    sub: 'user-999',
    roles: ['user']
  });

  // Validate for different audiences
  const gatewayValidation = await tokenManager.validateToken(
    token.accessToken,
    { audience: 'api-gateway' }
  );

  const orderValidation = await tokenManager.validateToken(
    token.accessToken,
    { audience: 'order-service' }
  );

  const invalidAudienceValidation = await tokenManager.validateToken(
    token.accessToken,
    { audience: 'unknown-service' }
  );

  console.log('Valid for API Gateway:', gatewayValidation.valid);
  console.log('Valid for Order Service:', orderValidation.valid);
  console.log('Valid for Unknown Service:', invalidAudienceValidation.valid);
}

/**
 * Example 7: Bulk User Token Revocation
 */
async function example7_BulkRevocation() {
  console.log('\n=== Example 7: Bulk User Token Revocation ===\n');

  const tokenManager = new AccessToken({
    secret: 'super-secret-key-change-in-production'
  });

  const userId = 'user-compromised';

  // Generate multiple tokens for the same user
  const tokens = [];
  for (let i = 0; i < 5; i++) {
    const token = await tokenManager.generateToken({
      sub: userId,
      roles: ['user']
    });
    tokens.push(token);
  }

  console.log(`Generated ${tokens.length} tokens for user`);
  console.log('Token Stats Before:', tokenManager.getTokenStats());

  // Revoke all tokens for compromised user
  const revokedCount = await tokenManager.revokeUserTokens(userId);
  console.log(`\nRevoked ${revokedCount} tokens for user ${userId}`);

  // Verify all tokens are revoked
  let validCount = 0;
  for (const token of tokens) {
    const validation = await tokenManager.validateToken(token.accessToken);
    if (validation.valid) validCount++;
  }

  console.log(`Valid tokens remaining: ${validCount}`);
  console.log('Token Stats After:', tokenManager.getTokenStats());
}

/**
 * Example 8: Token Cleanup and Maintenance
 */
async function example8_TokenCleanup() {
  console.log('\n=== Example 8: Token Cleanup ===\n');

  const tokenManager = new AccessToken({
    secret: 'super-secret-key-change-in-production',
    accessTokenExpiry: 1 // 1 second for demo
  });

  // Generate some tokens
  for (let i = 0; i < 10; i++) {
    await tokenManager.generateToken({
      sub: `user-${i}`,
      roles: ['user']
    });
  }

  console.log('Initial Stats:', tokenManager.getTokenStats());

  // Wait for tokens to expire
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Cleanup expired tokens
  const cleanedUp = await tokenManager.cleanupExpiredTokens();
  console.log(`\nCleaned up ${cleanedUp} expired tokens`);
  console.log('Final Stats:', tokenManager.getTokenStats());
}

/**
 * Example 9: Custom Claims and Validation
 */
async function example9_CustomClaims() {
  console.log('\n=== Example 9: Custom Claims ===\n');

  const tokenManager = new AccessToken({
    secret: 'super-secret-key-change-in-production'
  });

  const token = await tokenManager.generateToken({
    sub: 'enterprise-user-001',
    roles: ['enterprise', 'admin'],
    claims: {
      company: 'TechCorp',
      department: 'Engineering',
      clearanceLevel: 5,
      features: ['advanced-analytics', 'api-access', 'bulk-export']
    }
  }, {
    additionalClaims: {
      sessionId: 'sess-' + Date.now(),
      ipAddress: '192.168.1.100'
    }
  });

  const validation = await tokenManager.validateToken(token.accessToken);

  console.log('Token Claims:', {
    company: validation.claims.company,
    department: validation.claims.department,
    clearanceLevel: validation.claims.clearanceLevel,
    features: validation.claims.features,
    sessionId: validation.payload.sessionId
  });
}

/**
 * Example 10: Distributed Microservices Auth Flow
 */
async function example10_MicroservicesAuthFlow() {
  console.log('\n=== Example 10: Microservices Auth Flow ===\n');

  // Simulate auth service
  const authService = new AccessToken({
    secret: 'shared-secret-across-services',
    issuer: 'auth-service',
    audience: ['api-gateway', 'user-service', 'order-service', 'payment-service']
  });

  // User logs in - generate token
  console.log('1. User Login');
  const loginTokens = await authService.generateToken({
    sub: 'user-12345',
    roles: ['premium-user'],
    claims: {
      email: 'premium@example.com',
      subscription: 'premium',
      features: ['unlimited-api', 'priority-support']
    }
  });

  console.log('   Access Token Generated');

  // API Gateway validates token
  console.log('\n2. API Gateway Validation');
  const gatewayValidation = await authService.validateToken(
    loginTokens.accessToken,
    { audience: 'api-gateway' }
  );
  console.log('   Token Valid:', gatewayValidation.valid);

  // Order Service validates and checks permissions
  console.log('\n3. Order Service Authorization');
  const orderValidation = await authService.validateToken(
    loginTokens.accessToken,
    {
      audience: 'order-service',
      requiredRoles: ['premium-user']
    }
  );
  console.log('   Authorized:', orderValidation.valid);
  console.log('   User Features:', orderValidation.claims.features);

  // Payment Service validates for sensitive operation
  console.log('\n4. Payment Service Validation');
  const paymentValidation = await authService.validateToken(
    loginTokens.accessToken,
    { audience: 'payment-service' }
  );
  console.log('   Payment Authorized:', paymentValidation.valid);

  // Token refresh before expiry
  console.log('\n5. Token Refresh');
  const refreshedTokens = await authService.refreshAccessToken(
    loginTokens.refreshToken
  );
  console.log('   New Token Generated');

  // User logout - revoke all tokens
  console.log('\n6. User Logout');
  await authService.revokeUserTokens('user-12345');
  console.log('   All user tokens revoked');

  const postLogoutValidation = await authService.validateToken(
    loginTokens.accessToken
  );
  console.log('   Old Token Valid:', postLogoutValidation.valid);
}

// Run all examples
async function runAllExamples() {
  try {
    await example1_BasicTokenManagement();
    await example2_TokenRefresh();
    await example3_RoleBasedAccess();
    await example4_TokenRevocation();
    await example5_ServiceApiKeys();
    await example6_MultiAudience();
    await example7_BulkRevocation();
    await example8_TokenCleanup();
    await example9_CustomClaims();
    await example10_MicroservicesAuthFlow();

    console.log('\n=== All Examples Completed Successfully ===\n');
  } catch (error) {
    console.error('Error running examples:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runAllExamples();
}

module.exports = {
  example1_BasicTokenManagement,
  example2_TokenRefresh,
  example3_RoleBasedAccess,
  example4_TokenRevocation,
  example5_ServiceApiKeys,
  example6_MultiAudience,
  example7_BulkRevocation,
  example8_TokenCleanup,
  example9_CustomClaims,
  example10_MicroservicesAuthFlow
};
