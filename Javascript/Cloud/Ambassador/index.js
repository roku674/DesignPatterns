/**
 * Ambassador Pattern - Comprehensive Usage Examples
 *
 * Demonstrates the Ambassador pattern for handling cross-cutting concerns
 * in distributed systems including retries, circuit breaking, connection
 * pooling, monitoring, and protocol translation.
 */

const {
  Ambassador,
  AmbassadorProxy,
  CircuitBreaker,
  RetryPolicy,
  ConnectionPool,
  CircuitState
} = require('./Ambassador');

/**
 * Scenario 1: Basic Ambassador Proxy with Retries and Circuit Breaking
 * Demonstrates creating a proxy with automatic retry and circuit breaker
 */
async function scenario1_BasicAmbassadorProxy() {
  console.log('\n=== Scenario 1: Basic Ambassador Proxy ===\n');

  const proxy = Ambassador.createProxy('https://api.example.com', {
    circuitBreaker: {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 5000
    },
    retryPolicy: {
      maxRetries: 3,
      baseDelay: 1000,
      exponentialBackoff: true
    },
    timeout: 10000
  });

  try {
    // Make successful requests
    console.log('Making requests through ambassador...');

    for (let i = 1; i <= 5; i++) {
      const response = await proxy.request({
        method: 'GET',
        path: `/users/${i}`,
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`Request ${i} - Status: ${response.statusCode}`);
    }

    // Check status
    const status = proxy.getStatus();
    console.log('\nAmbassador Status:');
    console.log('Circuit Breaker:', status.circuitBreaker.state);
    console.log('Metrics:', status.metrics);
    console.log('Connection Pool:', status.connectionPool);

  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

/**
 * Scenario 2: Circuit Breaker State Management
 * Demonstrates circuit breaker behavior with failures
 */
async function scenario2_CircuitBreakerBehavior() {
  console.log('\n=== Scenario 2: Circuit Breaker Behavior ===\n');

  const circuitBreaker = Ambassador.createCircuitBreaker({
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 3000
  });

  // Simulate failing operations
  console.log('Simulating failures...');

  for (let i = 1; i <= 5; i++) {
    try {
      await circuitBreaker.execute(async () => {
        if (i <= 3) {
          throw new Error('Service unavailable');
        }
        return { success: true };
      });
      console.log(`Attempt ${i}: SUCCESS`);
    } catch (error) {
      console.log(`Attempt ${i}: FAILED - ${error.message}`);
      console.log(`  Circuit State: ${circuitBreaker.getState().state}`);
    }
  }

  // Wait for timeout and retry
  console.log('\nWaiting for circuit breaker timeout...');
  await new Promise(resolve => setTimeout(resolve, 3500));

  console.log('Attempting request after timeout...');
  try {
    await circuitBreaker.execute(async () => {
      return { success: true };
    });
    console.log('Request succeeded - Circuit entering HALF_OPEN');
    console.log('Circuit State:', circuitBreaker.getState().state);
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

/**
 * Scenario 3: Connection Pooling
 * Demonstrates connection pool management and reuse
 */
async function scenario3_ConnectionPooling() {
  console.log('\n=== Scenario 3: Connection Pooling ===\n');

  const pool = Ambassador.createConnectionPool({
    maxConnections: 5,
    maxIdleTime: 30000
  });

  console.log('Acquiring connections from pool...');
  const connections = [];

  // Acquire multiple connections
  for (let i = 0; i < 5; i++) {
    const conn = await pool.acquire();
    connections.push(conn);
    console.log(`Acquired connection ${i + 1}: ${conn.id}`);
    console.log('Pool status:', pool.getStatus());
  }

  // Try to acquire when pool is exhausted
  console.log('\nTrying to acquire connection when pool is exhausted...');
  try {
    await pool.acquire();
  } catch (error) {
    console.log('Expected error:', error.message);
  }

  // Release connections
  console.log('\nReleasing connections...');
  connections.forEach((conn, index) => {
    pool.release(conn);
    console.log(`Released connection ${index + 1}`);
  });

  console.log('\nFinal pool status:', pool.getStatus());

  // Reuse released connections
  console.log('\nReusing released connection...');
  const reusedConn = await pool.acquire();
  console.log('Reused connection:', reusedConn.id);
  console.log('Connection was from pool:', connections.some(c => c.id === reusedConn.id));
}

/**
 * Scenario 4: Retry Policy with Exponential Backoff
 * Demonstrates retry logic with configurable backoff strategies
 */
async function scenario4_RetryPolicy() {
  console.log('\n=== Scenario 4: Retry Policy ===\n');

  const retryPolicy = Ambassador.createRetryPolicy({
    maxRetries: 4,
    baseDelay: 500,
    maxDelay: 5000,
    exponentialBackoff: true
  });

  let attempts = 0;

  console.log('Executing operation with retry policy...');
  try {
    await retryPolicy.execute(async () => {
      attempts++;
      console.log(`Attempt ${attempts} at ${new Date().toISOString()}`);

      if (attempts < 3) {
        throw new Error('Temporary failure');
      }

      return { success: true, attempts };
    });
    console.log(`\nOperation succeeded after ${attempts} attempts`);
  } catch (error) {
    console.error('Operation failed:', error.message);
  }

  // Test with all failures
  console.log('\n\nTesting with all failures...');
  attempts = 0;

  const retryPolicy2 = Ambassador.createRetryPolicy({
    maxRetries: 3,
    baseDelay: 200,
    exponentialBackoff: false
  });

  try {
    await retryPolicy2.execute(async () => {
      attempts++;
      console.log(`Attempt ${attempts}`);
      throw new Error('Permanent failure');
    });
  } catch (error) {
    console.log(`\nFailed after ${attempts} attempts: ${error.message}`);
  }
}

/**
 * Scenario 5: Microservices Communication
 * Demonstrates ambassador pattern in microservices architecture
 */
async function scenario5_MicroservicesCommunication() {
  console.log('\n=== Scenario 5: Microservices Communication ===\n');

  // Create ambassadors for multiple services
  const userServiceProxy = Ambassador.createProxy('https://users-service', {
    circuitBreaker: { failureThreshold: 5 },
    retryPolicy: { maxRetries: 2 }
  });

  const orderServiceProxy = Ambassador.createProxy('https://orders-service', {
    circuitBreaker: { failureThreshold: 3 },
    retryPolicy: { maxRetries: 3 }
  });

  const inventoryServiceProxy = Ambassador.createProxy('https://inventory-service', {
    circuitBreaker: { failureThreshold: 4 },
    retryPolicy: { maxRetries: 2 }
  });

  console.log('Orchestrating microservices call...');

  try {
    // Get user info
    console.log('\n1. Fetching user information...');
    const userResponse = await userServiceProxy.request({
      method: 'GET',
      path: '/users/123'
    });
    console.log('User fetched successfully');

    // Get orders
    console.log('\n2. Fetching user orders...');
    const ordersResponse = await orderServiceProxy.request({
      method: 'GET',
      path: '/orders?userId=123'
    });
    console.log('Orders fetched successfully');

    // Check inventory
    console.log('\n3. Checking inventory...');
    const inventoryResponse = await inventoryServiceProxy.request({
      method: 'GET',
      path: '/inventory/items'
    });
    console.log('Inventory checked successfully');

    console.log('\n=== Service Health Summary ===');
    console.log('\nUser Service:', userServiceProxy.getMetrics());
    console.log('\nOrder Service:', orderServiceProxy.getMetrics());
    console.log('\nInventory Service:', inventoryServiceProxy.getMetrics());

  } catch (error) {
    console.error('Microservices orchestration failed:', error.message);
  }
}

/**
 * Scenario 6: API Gateway with Ambassador Pattern
 * Demonstrates using ambassador as API gateway proxy
 */
async function scenario6_APIGateway() {
  console.log('\n=== Scenario 6: API Gateway with Ambassador ===\n');

  const gateway = new AmbassadorProxy('https://backend-api', {
    circuitBreaker: {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 10000
    },
    retryPolicy: {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      exponentialBackoff: true
    },
    connectionPool: {
      maxConnections: 20,
      maxIdleTime: 60000
    },
    requestLogger: {
      enabled: true,
      maxLogs: 100
    },
    timeout: 30000
  });

  console.log('Processing API requests through gateway...');

  const endpoints = [
    { method: 'GET', path: '/api/v1/products' },
    { method: 'POST', path: '/api/v1/orders', body: { items: [1, 2, 3] } },
    { method: 'GET', path: '/api/v1/users/profile' },
    { method: 'PUT', path: '/api/v1/users/settings', body: { theme: 'dark' } },
    { method: 'GET', path: '/api/v1/analytics' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n${endpoint.method} ${endpoint.path}`);
      const response = await gateway.request(endpoint);
      console.log(`  Status: ${response.statusCode}`);
    } catch (error) {
      console.log(`  Error: ${error.message}`);
    }
  }

  const status = gateway.getStatus();
  console.log('\n=== Gateway Status ===');
  console.log('Circuit Breaker:', status.circuitBreaker);
  console.log('Connection Pool:', status.connectionPool);
  console.log('Metrics:', gateway.getMetrics());
  console.log('\nRecent Logs:');
  status.recentLogs.forEach(log => {
    console.log(`  [${log.type}] ${log.method || ''} ${log.url || ''} ${log.message || ''}`);
  });
}

/**
 * Scenario 7: Load Balancing with Multiple Backends
 * Demonstrates ambassador pattern with load balancing
 */
async function scenario7_LoadBalancing() {
  console.log('\n=== Scenario 7: Load Balancing ===\n');

  // Create ambassadors for multiple backend instances
  const backends = [
    Ambassador.createProxy('https://backend1.example.com', {
      circuitBreaker: { failureThreshold: 3 }
    }),
    Ambassador.createProxy('https://backend2.example.com', {
      circuitBreaker: { failureThreshold: 3 }
    }),
    Ambassador.createProxy('https://backend3.example.com', {
      circuitBreaker: { failureThreshold: 3 }
    })
  ];

  let currentBackend = 0;

  // Round-robin load balancing
  async function makeRequest(options) {
    const backend = backends[currentBackend];
    currentBackend = (currentBackend + 1) % backends.length;

    try {
      return await backend.request(options);
    } catch (error) {
      console.log(`Backend ${currentBackend} failed, trying next...`);
      // Try next backend on failure
      return await backends[(currentBackend + 1) % backends.length].request(options);
    }
  }

  console.log('Distributing requests across backends...');

  for (let i = 1; i <= 9; i++) {
    try {
      const response = await makeRequest({
        method: 'GET',
        path: `/data/${i}`
      });
      console.log(`Request ${i}: SUCCESS (Backend ${currentBackend})`);
    } catch (error) {
      console.log(`Request ${i}: FAILED`);
    }
  }

  console.log('\n=== Backend Health ===');
  backends.forEach((backend, index) => {
    const metrics = backend.getMetrics();
    console.log(`\nBackend ${index + 1}:`, metrics);
  });
}

/**
 * Scenario 8: Service Mesh Integration
 * Demonstrates ambassador pattern in service mesh
 */
async function scenario8_ServiceMesh() {
  console.log('\n=== Scenario 8: Service Mesh Integration ===\n');

  // Create service mesh with ambassadors for each service
  const serviceMesh = {
    frontend: Ambassador.createProxy('https://frontend-service', {
      circuitBreaker: { failureThreshold: 5 },
      retryPolicy: { maxRetries: 2 }
    }),
    backend: Ambassador.createProxy('https://backend-service', {
      circuitBreaker: { failureThreshold: 5 },
      retryPolicy: { maxRetries: 3 }
    }),
    database: Ambassador.createProxy('https://database-service', {
      circuitBreaker: { failureThreshold: 3 },
      retryPolicy: { maxRetries: 2 }
    }),
    cache: Ambassador.createProxy('https://cache-service', {
      circuitBreaker: { failureThreshold: 10 },
      retryPolicy: { maxRetries: 1 }
    })
  };

  console.log('Service mesh topology created');
  console.log('Services:', Object.keys(serviceMesh).join(', '));

  // Simulate service-to-service communication
  console.log('\n=== Service Communication Flow ===');

  try {
    console.log('\n1. Frontend -> Backend');
    await serviceMesh.frontend.request({
      method: 'GET',
      path: '/api/data'
    });
    console.log('   Communication successful');

    console.log('\n2. Backend -> Database');
    await serviceMesh.backend.request({
      method: 'POST',
      path: '/query',
      body: { table: 'users', query: 'SELECT * FROM users' }
    });
    console.log('   Database query successful');

    console.log('\n3. Backend -> Cache');
    await serviceMesh.cache.request({
      method: 'GET',
      path: '/cache/user:123'
    });
    console.log('   Cache hit');

    console.log('\n=== Service Mesh Health ===');
    Object.entries(serviceMesh).forEach(([name, proxy]) => {
      const status = proxy.getStatus();
      console.log(`\n${name.toUpperCase()}:`);
      console.log('  Circuit:', status.circuitBreaker.state);
      console.log('  Requests:', status.metrics.requests);
      console.log('  Success Rate:',
        ((status.metrics.successes / status.metrics.requests) * 100).toFixed(2) + '%'
      );
    });

  } catch (error) {
    console.error('Service mesh communication failed:', error.message);
  }
}

/**
 * Scenario 9: Protocol Translation
 * Demonstrates protocol translation between different formats
 */
async function scenario9_ProtocolTranslation() {
  console.log('\n=== Scenario 9: Protocol Translation ===\n');

  const proxy = new AmbassadorProxy('https://legacy-service', {
    protocolTranslator: {
      sourceProtocol: 'rest',
      targetProtocol: 'soap',
      translators: {
        'rest-to-soap': (request) => {
          console.log('Translating REST to SOAP...');
          return {
            ...request,
            headers: {
              ...request.headers,
              'Content-Type': 'application/soap+xml'
            },
            body: `
              <soap:Envelope>
                <soap:Body>
                  ${JSON.stringify(request.body)}
                </soap:Body>
              </soap:Envelope>
            `
          };
        },
        'soap-to-rest': (response) => {
          console.log('Translating SOAP to REST...');
          return {
            ...response,
            headers: {
              ...response.headers,
              'Content-Type': 'application/json'
            }
          };
        }
      }
    }
  });

  console.log('Making REST request that translates to SOAP...');

  const response = await proxy.request({
    method: 'POST',
    path: '/legacy/operation',
    body: {
      action: 'getUserData',
      userId: 123
    }
  });

  console.log('Request completed with protocol translation');
  console.log('Response status:', response.statusCode);
}

/**
 * Scenario 10: Monitoring and Observability
 * Demonstrates comprehensive monitoring and metrics collection
 */
async function scenario10_MonitoringAndObservability() {
  console.log('\n=== Scenario 10: Monitoring and Observability ===\n');

  const proxy = Ambassador.createProxy('https://monitored-service', {
    circuitBreaker: {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 5000
    },
    retryPolicy: {
      maxRetries: 3,
      baseDelay: 500
    },
    connectionPool: {
      maxConnections: 10
    },
    requestLogger: {
      enabled: true,
      maxLogs: 50
    }
  });

  console.log('Generating traffic for monitoring...');

  // Generate various request patterns
  for (let i = 1; i <= 20; i++) {
    try {
      await proxy.request({
        method: i % 3 === 0 ? 'POST' : 'GET',
        path: `/endpoint/${i}`,
        body: i % 3 === 0 ? { data: `payload-${i}` } : undefined
      });
    } catch (error) {
      // Some requests may fail
    }
  }

  console.log('\n=== Comprehensive Metrics ===');

  const metrics = proxy.getMetrics();
  console.log('\nRequest Metrics:');
  console.log('  Total Requests:', metrics.requests);
  console.log('  Successful:', metrics.successes);
  console.log('  Failed:', metrics.failures);
  console.log('  Success Rate:', metrics.successRate.toFixed(2) + '%');
  console.log('  Failure Rate:', metrics.failureRate.toFixed(2) + '%');
  console.log('  Retries:', metrics.retries);
  console.log('  Circuit Breaks:', metrics.circuitBreaks);

  const status = proxy.getStatus();
  console.log('\nCircuit Breaker:');
  console.log('  State:', status.circuitBreaker.state);
  console.log('  Failures:', status.circuitBreaker.failures);
  console.log('  Successes:', status.circuitBreaker.successes);

  console.log('\nConnection Pool:');
  console.log('  Total Connections:', status.connectionPool.total);
  console.log('  Active:', status.connectionPool.active);
  console.log('  Idle:', status.connectionPool.idle);
  console.log('  Max:', status.connectionPool.maxConnections);

  console.log('\nRecent Activity (Last 10 logs):');
  const logs = status.recentLogs;
  logs.forEach((log, index) => {
    const timestamp = new Date(log.timestamp).toISOString();
    console.log(`  ${index + 1}. [${log.type}] ${timestamp}`);
    if (log.method) console.log(`     ${log.method} ${log.url}`);
    if (log.message) console.log(`     ${log.message}`);
    if (log.duration) console.log(`     Duration: ${log.duration}ms`);
  });

  // Export metrics for external monitoring
  console.log('\n=== Exportable Metrics (JSON) ===');
  const exportableMetrics = {
    timestamp: new Date().toISOString(),
    service: 'monitored-service',
    ambassador: {
      metrics: proxy.getMetrics(),
      circuit: status.circuitBreaker,
      pool: status.connectionPool
    }
  };
  console.log(JSON.stringify(exportableMetrics, null, 2));
}

/**
 * Run all scenarios
 */
async function runAllScenarios() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║      Ambassador Pattern - Comprehensive Usage Examples        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  try {
    await scenario1_BasicAmbassadorProxy();
    await scenario2_CircuitBreakerBehavior();
    await scenario3_ConnectionPooling();
    await scenario4_RetryPolicy();
    await scenario5_MicroservicesCommunication();
    await scenario6_APIGateway();
    await scenario7_LoadBalancing();
    await scenario8_ServiceMesh();
    await scenario9_ProtocolTranslation();
    await scenario10_MonitoringAndObservability();

    console.log('\n\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║           All Ambassador Pattern Scenarios Complete!           ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('Error running scenarios:', error);
  }
}

// Run all scenarios if executed directly
if (require.main === module) {
  runAllScenarios();
}

module.exports = {
  scenario1_BasicAmbassadorProxy,
  scenario2_CircuitBreakerBehavior,
  scenario3_ConnectionPooling,
  scenario4_RetryPolicy,
  scenario5_MicroservicesCommunication,
  scenario6_APIGateway,
  scenario7_LoadBalancing,
  scenario8_ServiceMesh,
  scenario9_ProtocolTranslation,
  scenario10_MonitoringAndObservability,
  runAllScenarios
};
