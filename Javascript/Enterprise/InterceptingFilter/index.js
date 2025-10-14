/**
 * Intercepting Filter Pattern Demonstration
 *
 * The Intercepting Filter pattern provides a pluggable mechanism to preprocess
 * and postprocess requests. Filters can be chained together to handle cross-cutting
 * concerns like authentication, logging, validation, and more.
 *
 * Real-world scenarios demonstrated:
 * 1. Authentication and authorization pipeline
 * 2. Request logging and monitoring
 * 3. Input validation and sanitization
 * 4. CORS handling for APIs
 * 5. Rate limiting
 * 6. Response caching
 * 7. Error handling
 * 8. Request/Response compression
 * 9. Filter priority and ordering
 * 10. Dynamic filter management
 */

const {
  FilterManager,
  AuthenticationFilter,
  AuthorizationFilter,
  LoggingFilter,
  ValidationFilter,
  CORSFilter,
  RateLimitFilter,
  CompressionFilter,
  CachingFilter,
  ErrorHandlingFilter,
  SanitizationFilter
} = require('./InterceptingFilter');

// Mock Services
class MockAuthService {
  async validateToken(token) {
    if (token === 'valid-token-123') {
      return {
        id: '1',
        username: 'john',
        permissions: ['read', 'write']
      };
    }
    if (token === 'readonly-token-456') {
      return {
        id: '2',
        username: 'jane',
        permissions: ['read']
      };
    }
    return null;
  }
}

// Mock Target Handler
class MockTarget {
  async execute(request, response) {
    response.status = 200;
    response.body = {
      message: 'Request processed successfully',
      path: request.path,
      user: request.user?.username || 'anonymous'
    };
  }
}

// Helper to display results
function displayResult(title, response) {
  console.log(`\n${title}`);
  console.log('Status:', response.status);
  console.log('Headers:', JSON.stringify(response.headers || {}, null, 2));
  console.log('Body:', JSON.stringify(response.body || {}, null, 2));
}

// =============================================================================
// Scenario 1: Authentication Filter
// =============================================================================
console.log('=== Scenario 1: Authentication Filter ===');

(async () => {
  const authService = new MockAuthService();
  const filterManager = new FilterManager();
  const target = new MockTarget();

  // Add authentication filter
  const authFilter = new AuthenticationFilter(authService, ['/public']);
  filterManager.addFilter(authFilter, 10);

  // Test 1: Request without token (should fail)
  console.log('\nTest 1: Request without authentication token');
  const request1 = {
    method: 'GET',
    path: '/api/users',
    headers: {}
  };
  const response1 = {};
  const chain1 = filterManager.createFilterChain(target);
  await chain1.doFilter(request1, response1);
  displayResult('Unauthenticated Request:', response1);

  // Test 2: Request with invalid token
  console.log('\nTest 2: Request with invalid token');
  const request2 = {
    method: 'GET',
    path: '/api/users',
    headers: { authorization: 'Bearer invalid-token' }
  };
  const response2 = {};
  const chain2 = filterManager.createFilterChain(target);
  await chain2.doFilter(request2, response2);
  displayResult('Invalid Token Request:', response2);

  // Test 3: Request with valid token
  console.log('\nTest 3: Request with valid token');
  const request3 = {
    method: 'GET',
    path: '/api/users',
    headers: { authorization: 'Bearer valid-token-123' }
  };
  const response3 = {};
  const chain3 = filterManager.createFilterChain(target);
  await chain3.doFilter(request3, response3);
  displayResult('Valid Token Request:', response3);

  // Test 4: Request to excluded path
  console.log('\nTest 4: Request to public path (no auth required)');
  const request4 = {
    method: 'GET',
    path: '/public/info',
    headers: {}
  };
  const response4 = {};
  const chain4 = filterManager.createFilterChain(target);
  await chain4.doFilter(request4, response4);
  displayResult('Public Path Request:', response4);
})();

// =============================================================================
// Scenario 2: Authentication + Authorization Pipeline
// =============================================================================
console.log('\n\n=== Scenario 2: Authentication + Authorization Pipeline ===');

(async () => {
  const authService = new MockAuthService();
  const filterManager = new FilterManager();
  const target = new MockTarget();

  // Add filters in order
  filterManager.addFilter(new AuthenticationFilter(authService), 10);
  filterManager.addFilter(new AuthorizationFilter({
    '/api/admin': 'admin',
    '/api/write': 'write',
    '/api/read': 'read'
  }), 20);

  // Test 1: User with read permission accessing write endpoint
  console.log('\nTest 1: Insufficient permissions');
  const request1 = {
    method: 'POST',
    path: '/api/write',
    headers: { authorization: 'Bearer readonly-token-456' }
  };
  const response1 = {};
  const chain1 = filterManager.createFilterChain(target);
  await chain1.doFilter(request1, response1);
  displayResult('Insufficient Permissions:', response1);

  // Test 2: User with write permission
  console.log('\nTest 2: Sufficient permissions');
  const request2 = {
    method: 'POST',
    path: '/api/write',
    headers: { authorization: 'Bearer valid-token-123' }
  };
  const response2 = {};
  const chain2 = filterManager.createFilterChain(target);
  await chain2.doFilter(request2, response2);
  displayResult('Authorized Request:', response2);
})();

// =============================================================================
// Scenario 3: Logging Filter
// =============================================================================
console.log('\n\n=== Scenario 3: Request Logging ===');

(async () => {
  const filterManager = new FilterManager();
  const target = new MockTarget();

  filterManager.addFilter(new LoggingFilter(), 1);

  const request = {
    method: 'GET',
    path: '/api/products'
  };
  const response = {};
  const chain = filterManager.createFilterChain(target);
  await chain.doFilter(request, response);
  displayResult('Logged Request:', response);
})();

// =============================================================================
// Scenario 4: Validation Filter
// =============================================================================
console.log('\n\n=== Scenario 4: Request Validation ===');

(async () => {
  const filterManager = new FilterManager();
  const target = new MockTarget();

  const validationRules = {
    '/api/users': {
      requiredFields: ['username', 'email'],
      validate: (body) => {
        const errors = [];
        if (body.email && !body.email.includes('@')) {
          errors.push('Invalid email format');
        }
        return errors;
      }
    }
  };

  filterManager.addFilter(new ValidationFilter(validationRules), 5);

  // Test 1: Missing required fields
  console.log('\nTest 1: Missing required fields');
  const request1 = {
    method: 'POST',
    path: '/api/users',
    body: { username: 'john' }
  };
  const response1 = {};
  const chain1 = filterManager.createFilterChain(target);
  await chain1.doFilter(request1, response1);
  displayResult('Validation Error:', response1);

  // Test 2: Invalid email format
  console.log('\nTest 2: Invalid email format');
  const request2 = {
    method: 'POST',
    path: '/api/users',
    body: { username: 'john', email: 'invalid-email' }
  };
  const response2 = {};
  const chain2 = filterManager.createFilterChain(target);
  await chain2.doFilter(request2, response2);
  displayResult('Invalid Format:', response2);

  // Test 3: Valid data
  console.log('\nTest 3: Valid data');
  const request3 = {
    method: 'POST',
    path: '/api/users',
    body: { username: 'john', email: 'john@example.com' }
  };
  const response3 = {};
  const chain3 = filterManager.createFilterChain(target);
  await chain3.doFilter(request3, response3);
  displayResult('Valid Request:', response3);
})();

// =============================================================================
// Scenario 5: CORS Filter
// =============================================================================
console.log('\n\n=== Scenario 5: CORS Handling ===');

(async () => {
  const filterManager = new FilterManager();
  const target = new MockTarget();

  filterManager.addFilter(new CORSFilter({
    allowedOrigins: ['http://example.com'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }), 1);

  // Test 1: OPTIONS preflight request
  console.log('\nTest 1: CORS preflight (OPTIONS)');
  const request1 = {
    method: 'OPTIONS',
    path: '/api/data',
    headers: { origin: 'http://example.com' }
  };
  const response1 = {};
  const chain1 = filterManager.createFilterChain(target);
  await chain1.doFilter(request1, response1);
  displayResult('CORS Preflight:', response1);

  // Test 2: Regular request with CORS headers
  console.log('\nTest 2: Regular request with CORS');
  const request2 = {
    method: 'GET',
    path: '/api/data',
    headers: { origin: 'http://example.com' }
  };
  const response2 = {};
  const chain2 = filterManager.createFilterChain(target);
  await chain2.doFilter(request2, response2);
  displayResult('CORS Request:', response2);
})();

// =============================================================================
// Scenario 6: Rate Limiting
// =============================================================================
console.log('\n\n=== Scenario 6: Rate Limiting ===');

(async () => {
  const filterManager = new FilterManager();
  const target = new MockTarget();

  filterManager.addFilter(new RateLimitFilter({
    maxRequests: 3,
    windowMs: 60000
  }), 5);

  // Make multiple requests to trigger rate limit
  for (let i = 1; i <= 5; i++) {
    console.log(`\nRequest ${i}:`);
    const request = {
      method: 'GET',
      path: '/api/data',
      headers: { 'x-forwarded-for': '192.168.1.1' }
    };
    const response = {};
    const chain = filterManager.createFilterChain(target);
    await chain.doFilter(request, response);
    displayResult(`Rate Limit Test ${i}:`, response);
  }
})();

// =============================================================================
// Scenario 7: Caching Filter
// =============================================================================
console.log('\n\n=== Scenario 7: Response Caching ===');

(async () => {
  const filterManager = new FilterManager();
  const target = new MockTarget();

  filterManager.addFilter(new CachingFilter(5000), 10);

  // Test 1: First request (cache miss)
  console.log('\nTest 1: First request (should be cache MISS)');
  const request1 = {
    method: 'GET',
    path: '/api/products'
  };
  const response1 = {};
  const chain1 = filterManager.createFilterChain(target);
  await chain1.doFilter(request1, response1);
  displayResult('Cache Miss:', response1);

  // Test 2: Second request (cache hit)
  console.log('\nTest 2: Second request (should be cache HIT)');
  const request2 = {
    method: 'GET',
    path: '/api/products'
  };
  const response2 = {};
  const chain2 = filterManager.createFilterChain(target);
  await chain2.doFilter(request2, response2);
  displayResult('Cache Hit:', response2);

  // Test 3: POST request (not cached)
  console.log('\nTest 3: POST request (not cached)');
  const request3 = {
    method: 'POST',
    path: '/api/products',
    body: { name: 'New Product' }
  };
  const response3 = {};
  const chain3 = filterManager.createFilterChain(target);
  await chain3.doFilter(request3, response3);
  displayResult('POST Request:', response3);
})();

// =============================================================================
// Scenario 8: Sanitization Filter
// =============================================================================
console.log('\n\n=== Scenario 8: Input Sanitization ===');

(async () => {
  const filterManager = new FilterManager();
  const target = {
    async execute(request, response) {
      response.status = 200;
      response.body = {
        message: 'Sanitized input received',
        sanitized: request.body
      };
    }
  };

  filterManager.addFilter(new SanitizationFilter(), 5);

  const request = {
    method: 'POST',
    path: '/api/comments',
    body: {
      comment: '<script>alert("xss")</script>Hello <b>World</b>',
      name: '  John Doe  '
    }
  };
  const response = {};
  const chain = filterManager.createFilterChain(target);
  await chain.doFilter(request, response);
  displayResult('Sanitized Input:', response);
})();

// =============================================================================
// Scenario 9: Error Handling Filter
// =============================================================================
console.log('\n\n=== Scenario 9: Error Handling ===');

(async () => {
  const filterManager = new FilterManager();

  // Target that throws an error
  const errorTarget = {
    async execute(request, response) {
      throw new Error('Something went wrong in the handler!');
    }
  };

  // Error handler should be first (lowest priority)
  filterManager.addFilter(new ErrorHandlingFilter(), 1);
  filterManager.addFilter(new LoggingFilter(), 10);

  const request = {
    method: 'GET',
    path: '/api/error'
  };
  const response = {};
  const chain = filterManager.createFilterChain(errorTarget);
  await chain.doFilter(request, response);
  displayResult('Error Handled:', response);
})();

// =============================================================================
// Scenario 10: Complete Filter Pipeline
// =============================================================================
console.log('\n\n=== Scenario 10: Complete Filter Pipeline ===');

(async () => {
  const authService = new MockAuthService();
  const filterManager = new FilterManager();
  const target = new MockTarget();

  // Add all filters with priorities
  filterManager.addFilter(new ErrorHandlingFilter(), 1);
  filterManager.addFilter(new LoggingFilter(), 5);
  filterManager.addFilter(new CORSFilter(), 10);
  filterManager.addFilter(new RateLimitFilter({ maxRequests: 10 }), 15);
  filterManager.addFilter(new SanitizationFilter(), 20);
  filterManager.addFilter(new ValidationFilter({
    '/api/data': {
      requiredFields: ['name']
    }
  }), 25);
  filterManager.addFilter(new AuthenticationFilter(authService, ['/public']), 30);
  filterManager.addFilter(new CachingFilter(), 35);
  filterManager.addFilter(new CompressionFilter(), 40);

  console.log('\nRegistered Filters:');
  console.log(JSON.stringify(filterManager.getFilters(), null, 2));

  // Test complete pipeline
  console.log('\nTest: Complete pipeline with valid request');
  const request = {
    method: 'POST',
    path: '/api/data',
    headers: {
      authorization: 'Bearer valid-token-123',
      origin: 'http://example.com',
      'accept-encoding': 'gzip'
    },
    body: {
      name: 'Test Data',
      description: 'This is test data'
    }
  };
  const response = {};
  const chain = filterManager.createFilterChain(target);
  await chain.doFilter(request, response);
  displayResult('Complete Pipeline:', response);
})();

// =============================================================================
// Summary
// =============================================================================
console.log('\n\n=== Intercepting Filter Pattern Summary ===');
console.log('Benefits:');
console.log('  ✓ Pluggable and reusable filters');
console.log('  ✓ Separation of cross-cutting concerns');
console.log('  ✓ Easy to add, remove, or reorder filters');
console.log('  ✓ Centralized preprocessing and postprocessing');
console.log('  ✓ Clean and maintainable code');
console.log('  ✓ Filter chaining with proper execution order');
console.log('\nUse Cases:');
console.log('  • Authentication and authorization');
console.log('  • Request/response logging and monitoring');
console.log('  • Input validation and sanitization');
console.log('  • CORS and security headers');
console.log('  • Rate limiting and throttling');
console.log('  • Caching strategies');
console.log('  • Data compression and encryption');
console.log('  • Error handling and recovery');
console.log('\nFilter Execution Order:');
console.log('  1. Error Handling (wraps everything)');
console.log('  2. Logging (tracks requests)');
console.log('  3. CORS (handles preflight)');
console.log('  4. Rate Limiting (prevents abuse)');
console.log('  5. Sanitization (cleans input)');
console.log('  6. Validation (checks data)');
console.log('  7. Authentication (verifies identity)');
console.log('  8. Authorization (checks permissions)');
console.log('  9. Caching (optimizes responses)');
console.log('  10. Compression (reduces size)');
