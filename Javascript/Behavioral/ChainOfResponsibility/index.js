/**
 * Chain of Responsibility Pattern - HTTP Request Validation Demo
 * Demonstrates real-world request validation pipeline
 */

const {
  AuthenticationHandler,
  SchemaValidationHandler,
  RateLimitHandler,
  PermissionHandler,
  SanitizationHandler,
  RequestValidator
} = require('./support-system');

async function runDemo() {
  console.log('=== Chain of Responsibility Pattern - Request Validation Demo ===\n');

  // Example 1: Valid Request
  console.log('=== Example 1: Valid User Request ===\n');

  const userSchema = {
    required: ['username', 'email'],
    properties: {
      username: { type: 'string', minLength: 3 },
      email: { type: 'string', pattern: '^[^@]+@[^@]+\\.[^@]+$' }
    }
  };

  const validator = new RequestValidator();
  validator.buildChain([
    new AuthenticationHandler(),
    new SchemaValidationHandler(userSchema),
    new RateLimitHandler(5, 60000),
    new SanitizationHandler()
  ]);

  const validRequest = {
    headers: {
      authorization: 'Bearer valid_token_12345678'
    },
    body: {
      username: 'john_doe',
      email: 'john@example.com'
    },
    ip: '192.168.1.1'
  };

  const result1 = await validator.validate(validRequest);
  console.log('Request:', JSON.stringify(validRequest, null, 2));
  console.log('\nValidation Result:', result1.valid ? 'PASSED' : 'FAILED');
  if (result1.valid) {
    console.log('User:', result1.request.user);
    console.log('Sanitized Body:', result1.request.body);
  }
  console.log();

  // Example 2: Missing Authentication
  console.log('=== Example 2: Missing Authentication ===\n');

  const invalidAuthRequest = {
    headers: {},
    body: {
      username: 'jane_doe',
      email: 'jane@example.com'
    },
    ip: '192.168.1.2'
  };

  const result2 = await validator.validate(invalidAuthRequest);
  console.log('Validation Result:', result2.valid ? 'PASSED' : 'FAILED');
  if (!result2.valid) {
    console.log('Errors:', result2.errors);
  }
  console.log();

  // Example 3: Invalid Schema
  console.log('=== Example 3: Schema Validation Failure ===\n');

  const invalidSchemaRequest = {
    headers: {
      authorization: 'Bearer valid_token_87654321'
    },
    body: {
      username: 'ab',
      email: 'invalid-email'
    },
    ip: '192.168.1.3'
  };

  const result3 = await validator.validate(invalidSchemaRequest);
  console.log('Validation Result:', result3.valid ? 'PASSED' : 'FAILED');
  if (!result3.valid) {
    console.log('Errors:', result3.errors);
  }
  console.log();

  // Example 4: Rate Limiting
  console.log('=== Example 4: Rate Limit Testing ===\n');

  const rateLimitValidator = new RequestValidator();
  rateLimitValidator.buildChain([
    new AuthenticationHandler(),
    new RateLimitHandler(3, 60000)
  ]);

  const rateLimitRequest = {
    headers: {
      authorization: 'Bearer valid_token_99999999'
    },
    body: {},
    ip: '192.168.1.4'
  };

  for (let i = 1; i <= 5; i++) {
    const result = await rateLimitValidator.validate({ ...rateLimitRequest });
    console.log(`Request ${i}: ${result.valid ? 'PASSED' : 'FAILED'}`);
    if (!result.valid) {
      console.log('Error:', result.errors[0].message);
    }
  }
  console.log();

  // Example 5: Permission Check
  console.log('=== Example 5: Permission-Based Access ===\n');

  const adminValidator = new RequestValidator();
  adminValidator.buildChain([
    new AuthenticationHandler(),
    new PermissionHandler('admin')
  ]);

  const userRequest = {
    headers: {
      authorization: 'Bearer valid_token_user1234'
    },
    body: {},
    ip: '192.168.1.5'
  };

  const adminRequest = {
    headers: {
      authorization: 'Bearer valid_admin_token123'
    },
    body: {},
    ip: '192.168.1.6'
  };

  const result5a = await adminValidator.validate(userRequest);
  console.log('User attempting admin action:');
  console.log('Result:', result5a.valid ? 'PASSED' : 'FAILED');
  if (!result5a.valid) {
    console.log('Error:', result5a.errors[0].message);
  }
  console.log();

  const result5b = await adminValidator.validate(adminRequest);
  console.log('Admin attempting admin action:');
  console.log('Result:', result5b.valid ? 'PASSED' : 'FAILED');
  console.log();

  // Example 6: XSS Prevention
  console.log('=== Example 6: XSS Attack Prevention ===\n');

  const sanitizationValidator = new RequestValidator();
  sanitizationValidator.buildChain([
    new AuthenticationHandler(),
    new SanitizationHandler()
  ]);

  const xssRequest = {
    headers: {
      authorization: 'Bearer valid_token_12345678'
    },
    body: {
      comment: '<script>alert("XSS")</script>Hello World',
      name: 'John "Hacker" Doe'
    },
    ip: '192.168.1.7'
  };

  const result6 = await sanitizationValidator.validate(xssRequest);
  console.log('Original Body:', {
    comment: '<script>alert("XSS")</script>Hello World',
    name: 'John "Hacker" Doe'
  });
  console.log('Sanitized Body:', result6.request.body);
  console.log();

  console.log('=== Pattern Benefits ===\n');
  console.log('Real-world advantages:');
  console.log('  - Each validator handles one concern (Single Responsibility)');
  console.log('  - Easy to add new validators without changing existing code');
  console.log('  - Validators can be reordered or combined differently');
  console.log('  - Request flows through pipeline, enriched at each step');
  console.log('  - Early termination on validation failure (performance)');
  console.log('  - Async validation supported natively');
  console.log();

  console.log('=== Demo Complete ===');
}

runDemo().catch(console.error);
