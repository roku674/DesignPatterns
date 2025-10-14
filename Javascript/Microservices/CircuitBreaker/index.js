/**
 * Circuit Breaker Pattern - Comprehensive Usage Examples
 *
 * Demonstrates preventing cascading failures in microservices through
 * circuit breaker implementation with state management and metrics.
 */

const { CircuitBreaker, CircuitState } = require('./CircuitBreaker');

/**
 * Example 1: Basic Circuit Breaker Usage
 */
async function example1_BasicCircuitBreaker() {
  console.log('\n=== Example 1: Basic Circuit Breaker ===\n');

  const breaker = new CircuitBreaker({
    name: 'payment-service',
    failureThreshold: 3,
    resetTimeout: 5000,
    windowSize: 10000
  });

  // Listen to events
  breaker.on('stateChange', (data) => {
    console.log(`Circuit ${data.name}: ${data.from} -> ${data.to}`);
  });

  // Simulate unreliable service
  const unreliableService = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.6 ? resolve({ data: 'Success' }) : reject(new Error('Service failed'));
      }, 100);
    });
  };

  // Make calls through circuit breaker
  for (let i = 1; i <= 10; i++) {
    try {
      await breaker.execute(unreliableService);
      console.log(`Call ${i}: SUCCESS`);
    } catch (error) {
      console.log(`Call ${i}: FAILED - ${error.message}`);
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\nFinal Metrics:', breaker.getMetrics());
}

/**
 * Example 2: Multiple Service Circuit Breakers
 */
async function example2_MultipleCircuitBreakers() {
  console.log('\n=== Example 2: Multiple Service Breakers ===\n');

  const services = {
    userService: new CircuitBreaker({
      name: 'user-service',
      failureThreshold: 5,
      resetTimeout: 3000
    }),
    orderService: new CircuitBreaker({
      name: 'order-service',
      failureThreshold: 3,
      resetTimeout: 5000
    }),
    inventoryService: new CircuitBreaker({
      name: 'inventory-service',
      failureThreshold: 4,
      resetTimeout: 4000
    })
  };

  // Monitor all services
  Object.values(services).forEach(breaker => {
    breaker.on('stateChange', (data) => {
      console.log(`[${data.name}] Circuit: ${data.from} -> ${data.to}`);
    });
  });

  // Simulate calls to different services
  const simulateCall = async (serviceName, breaker, failureRate) => {
    try {
      await breaker.execute(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        if (Math.random() < failureRate) {
          throw new Error(`${serviceName} failed`);
        }
        return { service: serviceName, data: 'success' };
      });
      console.log(`${serviceName}: SUCCESS`);
    } catch (error) {
      console.log(`${serviceName}: ${error.message}`);
    }
  };

  // Simulate different failure rates
  for (let i = 0; i < 15; i++) {
    await Promise.all([
      simulateCall('user-service', services.userService, 0.3),
      simulateCall('order-service', services.orderService, 0.7),
      simulateCall('inventory-service', services.inventoryService, 0.5)
    ]);
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n=== Service Health Summary ===');
  Object.entries(services).forEach(([name, breaker]) => {
    const metrics = breaker.getMetrics();
    console.log(`\n${name}:`);
    console.log(`  State: ${metrics.state}`);
    console.log(`  Success Rate: ${(metrics.successRate * 100).toFixed(2)}%`);
    console.log(`  Total Calls: ${metrics.totalCalls}`);
    console.log(`  Rejected: ${metrics.rejectedCalls}`);
  });
}

/**
 * Example 3: Circuit Breaker with Retry Logic
 */
async function example3_CircuitBreakerWithRetry() {
  console.log('\n=== Example 3: Circuit Breaker with Retry ===\n');

  const breaker = new CircuitBreaker({
    name: 'api-gateway',
    failureThreshold: 5,
    resetTimeout: 6000
  });

  // Retry logic wrapper
  async function executeWithRetry(fn, maxRetries = 3, delayMs = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await breaker.execute(fn);
      } catch (error) {
        console.log(`Attempt ${attempt} failed: ${error.message}`);

        if (attempt < maxRetries && !error.message.includes('Circuit breaker')) {
          console.log(`Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        throw error;
      }
    }
  }

  // Simulate API call
  let callCount = 0;
  const apiCall = async () => {
    callCount++;
    // Fail first 3 calls, then succeed
    if (callCount <= 3) {
      throw new Error('Temporary service error');
    }
    return { status: 'ok', data: 'API response' };
  };

  try {
    const result = await executeWithRetry(apiCall);
    console.log('Final result:', result);
  } catch (error) {
    console.log('All retries exhausted:', error.message);
  }
}

/**
 * Example 4: Fallback Strategy with Circuit Breaker
 */
async function example4_FallbackStrategy() {
  console.log('\n=== Example 4: Fallback Strategy ===\n');

  const primaryBreaker = new CircuitBreaker({
    name: 'primary-service',
    failureThreshold: 3,
    resetTimeout: 5000
  });

  const secondaryBreaker = new CircuitBreaker({
    name: 'secondary-service',
    failureThreshold: 3,
    resetTimeout: 5000
  });

  // Cached data for ultimate fallback
  const cache = { data: 'Cached data from 5 minutes ago' };

  async function callWithFallback() {
    // Try primary service
    try {
      const result = await primaryBreaker.execute(async () => {
        throw new Error('Primary service down'); // Simulate failure
      });
      console.log('Primary service responded:', result);
      return result;
    } catch (primaryError) {
      console.log('Primary failed, trying secondary...');

      // Try secondary service
      try {
        const result = await secondaryBreaker.execute(async () => {
          return { source: 'secondary', data: 'Fresh data' };
        });
        console.log('Secondary service responded:', result);
        return result;
      } catch (secondaryError) {
        console.log('Secondary failed, using cache...');
        return { source: 'cache', ...cache };
      }
    }
  }

  // Make multiple calls
  for (let i = 1; i <= 5; i++) {
    console.log(`\nAttempt ${i}:`);
    const result = await callWithFallback();
    console.log('Final result:', result);
  }
}

/**
 * Example 5: Health Monitoring and Alerting
 */
async function example5_HealthMonitoring() {
  console.log('\n=== Example 5: Health Monitoring ===\n');

  const services = ['auth', 'user', 'order', 'payment', 'notification'].map(name => ({
    name,
    breaker: new CircuitBreaker({
      name: `${name}-service`,
      failureThreshold: 3,
      resetTimeout: 4000,
      failureRateThreshold: 0.6
    })
  }));

  // Health monitoring system
  const healthMonitor = {
    alerts: [],

    checkHealth(service) {
      const metrics = service.breaker.getMetrics();
      const health = {
        service: service.name,
        status: metrics.state,
        successRate: metrics.successRate,
        avgResponseTime: metrics.avgResponseTime,
        timestamp: Date.now()
      };

      // Alert on circuit open
      if (metrics.state === CircuitState.OPEN) {
        this.alert('CRITICAL', `${service.name} circuit is OPEN`);
      } else if (metrics.failureRate > 0.5 && metrics.totalCalls > 5) {
        this.alert('WARNING', `${service.name} has high failure rate: ${(metrics.failureRate * 100).toFixed(2)}%`);
      }

      return health;
    },

    alert(severity, message) {
      const alert = { severity, message, timestamp: new Date().toISOString() };
      this.alerts.push(alert);
      console.log(`[${severity}] ${message}`);
    },

    getReport() {
      return {
        services: services.map(s => this.checkHealth(s)),
        alerts: this.alerts
      };
    }
  };

  // Set up monitoring on each service
  services.forEach(service => {
    service.breaker.on('stateChange', (data) => {
      if (data.to === CircuitState.OPEN) {
        healthMonitor.alert('CRITICAL', `${data.name} circuit opened`);
      } else if (data.to === CircuitState.CLOSED) {
        healthMonitor.alert('INFO', `${data.name} circuit recovered`);
      }
    });
  });

  // Simulate traffic with varying failure rates
  const simulateTraffic = async () => {
    for (let i = 0; i < 20; i++) {
      await Promise.all(services.map(async (service) => {
        const failureRate = service.name === 'payment' ? 0.8 : 0.3; // Payment service has issues
        try {
          await service.breaker.execute(async () => {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
            if (Math.random() < failureRate) {
              throw new Error('Service error');
            }
            return { status: 'ok' };
          });
        } catch (error) {
          // Handled by circuit breaker
        }
      }));
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  await simulateTraffic();

  console.log('\n=== Health Report ===');
  const report = healthMonitor.getReport();
  console.log(JSON.stringify(report, null, 2));
}

/**
 * Example 6: Coordinated Circuit Breakers
 */
async function example6_CoordinatedBreakers() {
  console.log('\n=== Example 6: Coordinated Circuit Breakers ===\n');

  class ServiceOrchestrator {
    constructor() {
      this.breakers = new Map();
      this.dependencies = new Map();
    }

    registerService(name, config, dependencies = []) {
      const breaker = new CircuitBreaker({
        name,
        ...config
      });

      breaker.on('stateChange', (data) => {
        if (data.to === CircuitState.OPEN) {
          this.handleServiceFailure(name);
        }
      });

      this.breakers.set(name, breaker);
      this.dependencies.set(name, dependencies);
    }

    handleServiceFailure(serviceName) {
      console.log(`Service ${serviceName} failed, checking dependencies...`);

      // Find dependent services
      for (const [name, deps] of this.dependencies.entries()) {
        if (deps.includes(serviceName)) {
          console.log(`  ${name} depends on ${serviceName}, may be affected`);
        }
      }
    }

    async callService(name, fn) {
      const breaker = this.breakers.get(name);
      if (!breaker) {
        throw new Error(`Service ${name} not registered`);
      }

      // Check dependencies first
      const deps = this.dependencies.get(name) || [];
      for (const dep of deps) {
        const depBreaker = this.breakers.get(dep);
        if (depBreaker && depBreaker.getState() === CircuitState.OPEN) {
          throw new Error(`Dependency ${dep} is unavailable`);
        }
      }

      return await breaker.execute(fn);
    }

    getSystemHealth() {
      const health = {};
      for (const [name, breaker] of this.breakers.entries()) {
        health[name] = {
          state: breaker.getState(),
          metrics: breaker.getMetrics()
        };
      }
      return health;
    }
  }

  const orchestrator = new ServiceOrchestrator();

  // Register services with dependencies
  orchestrator.registerService('database', {
    failureThreshold: 3,
    resetTimeout: 5000
  });

  orchestrator.registerService('cache', {
    failureThreshold: 3,
    resetTimeout: 3000
  });

  orchestrator.registerService('user-service', {
    failureThreshold: 3,
    resetTimeout: 4000
  }, ['database', 'cache']);

  orchestrator.registerService('order-service', {
    failureThreshold: 3,
    resetTimeout: 4000
  }, ['database', 'user-service']);

  // Simulate coordinated calls
  const callOrder = async () => {
    try {
      await orchestrator.callService('order-service', async () => {
        return { order: 'created' };
      });
      console.log('Order created successfully');
    } catch (error) {
      console.log('Order failed:', error.message);
    }
  };

  // Fail database to see cascade
  const database = orchestrator.breakers.get('database');
  database.forceOpen();
  console.log('Database circuit forced open\n');

  await callOrder();

  console.log('\n=== System Health ===');
  console.log(JSON.stringify(orchestrator.getSystemHealth(), null, 2));
}

/**
 * Example 7: Dynamic Threshold Adjustment
 */
async function example7_DynamicThresholds() {
  console.log('\n=== Example 7: Dynamic Threshold Adjustment ===\n');

  class AdaptiveCircuitBreaker extends CircuitBreaker {
    constructor(options) {
      super(options);
      this.baseFailureThreshold = options.failureThreshold || 5;
      this.trafficLevel = 'normal';
    }

    adjustThresholdsBasedOnTraffic(requestsPerSecond) {
      if (requestsPerSecond > 100) {
        this.trafficLevel = 'high';
        this.failureThreshold = this.baseFailureThreshold * 2;
      } else if (requestsPerSecond < 10) {
        this.trafficLevel = 'low';
        this.failureThreshold = Math.max(2, this.baseFailureThreshold / 2);
      } else {
        this.trafficLevel = 'normal';
        this.failureThreshold = this.baseFailureThreshold;
      }

      console.log(`Traffic ${this.trafficLevel}: threshold adjusted to ${this.failureThreshold}`);
    }
  }

  const adaptiveBreaker = new AdaptiveCircuitBreaker({
    name: 'adaptive-service',
    failureThreshold: 5,
    resetTimeout: 5000
  });

  // Simulate traffic patterns
  const patterns = [
    { rps: 5, duration: 5, label: 'Low traffic' },
    { rps: 50, duration: 5, label: 'Normal traffic' },
    { rps: 150, duration: 5, label: 'High traffic' }
  ];

  for (const pattern of patterns) {
    console.log(`\n${pattern.label} (${pattern.rps} rps):`);
    adaptiveBreaker.adjustThresholdsBasedOnTraffic(pattern.rps);

    for (let i = 0; i < pattern.duration; i++) {
      try {
        await adaptiveBreaker.execute(async () => {
          if (Math.random() < 0.6) throw new Error('Failed');
          return { status: 'ok' };
        });
      } catch (error) {
        // Handled
      }
    }
  }

  console.log('\nFinal metrics:', adaptiveBreaker.getMetrics());
}

/**
 * Example 8: Circuit Breaker Dashboard
 */
async function example8_Dashboard() {
  console.log('\n=== Example 8: Real-time Dashboard ===\n');

  const services = ['api', 'db', 'cache', 'queue'].map(name => ({
    name,
    breaker: new CircuitBreaker({
      name: `${name}-service`,
      failureThreshold: 3,
      resetTimeout: 3000
    })
  }));

  const dashboard = {
    updateInterval: null,

    start() {
      this.updateInterval = setInterval(() => this.render(), 1000);
    },

    stop() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
      }
    },

    render() {
      console.clear();
      console.log('='.repeat(80));
      console.log('CIRCUIT BREAKER DASHBOARD'.padStart(50));
      console.log('='.repeat(80));
      console.log();

      services.forEach(service => {
        const metrics = service.breaker.getMetrics();
        const stateIcon = {
          [CircuitState.CLOSED]: '✓',
          [CircuitState.OPEN]: '✗',
          [CircuitState.HALF_OPEN]: '?'
        }[metrics.state];

        console.log(`${stateIcon} ${service.name.padEnd(15)} ${metrics.state.padEnd(15)}`);
        console.log(`  Success Rate: ${(metrics.successRate * 100).toFixed(1)}%`.padEnd(30) +
                    `Avg Response: ${metrics.avgResponseTime.toFixed(0)}ms`);
        console.log(`  Calls: ${metrics.totalCalls}`.padEnd(20) +
                    `Failed: ${metrics.failedCalls}`.padEnd(20) +
                    `Rejected: ${metrics.rejectedCalls}`);
        console.log();
      });
    }
  };

  // Start dashboard
  dashboard.start();

  // Simulate traffic
  const traffic = async () => {
    for (let i = 0; i < 30; i++) {
      await Promise.all(services.map(async (service) => {
        try {
          await service.breaker.execute(async () => {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
            if (Math.random() < (service.name === 'db' ? 0.7 : 0.3)) {
              throw new Error('Error');
            }
            return { status: 'ok' };
          });
        } catch (error) {
          // Handled
        }
      }));
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  await traffic();
  dashboard.stop();
  console.log('\nDashboard stopped');
}

/**
 * Example 9: Distributed Circuit Breaker State
 */
async function example9_DistributedState() {
  console.log('\n=== Example 9: Distributed Circuit Breaker ===\n');

  class DistributedCircuitBreaker extends CircuitBreaker {
    constructor(options) {
      super(options);
      this.stateStore = new Map(); // Simulates Redis/distributed cache
      this.instanceId = Math.random().toString(36).substr(2, 9);
    }

    async syncStateToStore() {
      const state = {
        state: this.state,
        failureCount: this.failureCounter.getFailureCount(),
        timestamp: Date.now(),
        instanceId: this.instanceId
      };
      this.stateStore.set(this.name, state);
    }

    async syncStateFromStore() {
      const stored = this.stateStore.get(this.name);
      if (stored && stored.instanceId !== this.instanceId) {
        console.log(`Instance ${this.instanceId}: synced state from ${stored.instanceId}`);
        if (stored.state !== this.state) {
          this.state = stored.state;
        }
      }
    }

    async execute(fn, correlationId) {
      await this.syncStateFromStore();
      const result = await super.execute(fn, correlationId);
      await this.syncStateToStore();
      return result;
    }
  }

  // Simulate multiple instances
  const instances = [1, 2, 3].map(id =>
    new DistributedCircuitBreaker({
      name: 'shared-service',
      failureThreshold: 3,
      resetTimeout: 5000
    })
  );

  console.log('Three instances sharing circuit breaker state\n');

  // Make calls from different instances
  for (let i = 0; i < 10; i++) {
    const instance = instances[i % instances.length];
    try {
      await instance.execute(async () => {
        if (Math.random() < 0.7) throw new Error('Failed');
        return { status: 'ok' };
      });
      console.log(`Instance ${instance.instanceId.substr(0, 4)}: SUCCESS`);
    } catch (error) {
      console.log(`Instance ${instance.instanceId.substr(0, 4)}: ${error.message}`);
    }
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\nAll instances final state:');
  instances.forEach((instance, idx) => {
    console.log(`Instance ${idx + 1}: ${instance.getState()}`);
  });
}

/**
 * Example 10: Production Microservices Scenario
 */
async function example10_ProductionScenario() {
  console.log('\n=== Example 10: Production Microservices ===\n');

  // Create breakers for entire service mesh
  const serviceMesh = {
    apiGateway: new CircuitBreaker({
      name: 'api-gateway',
      failureThreshold: 10,
      resetTimeout: 10000,
      windowSize: 30000
    }),
    authService: new CircuitBreaker({
      name: 'auth-service',
      failureThreshold: 5,
      resetTimeout: 5000
    }),
    userService: new CircuitBreaker({
      name: 'user-service',
      failureThreshold: 5,
      resetTimeout: 5000
    }),
    orderService: new CircuitBreaker({
      name: 'order-service',
      failureThreshold: 8,
      resetTimeout: 8000
    }),
    paymentService: new CircuitBreaker({
      name: 'payment-service',
      failureThreshold: 3,
      resetTimeout: 15000
    }),
    inventoryService: new CircuitBreaker({
      name: 'inventory-service',
      failureThreshold: 5,
      resetTimeout: 6000
    }),
    notificationService: new CircuitBreaker({
      name: 'notification-service',
      failureThreshold: 10,
      resetTimeout: 3000
    })
  };

  // Monitor all services
  Object.values(serviceMesh).forEach(breaker => {
    breaker.on('stateChange', (data) => {
      console.log(`[${new Date().toISOString()}] ${data.name}: ${data.from} -> ${data.to}`);
    });
  });

  // Simulate complete order flow
  async function processOrder(orderId) {
    const startTime = Date.now();
    console.log(`\nProcessing order ${orderId}...`);

    try {
      // 1. Authenticate
      await serviceMesh.authService.execute(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return { authenticated: true };
      });

      // 2. Get user details
      const user = await serviceMesh.userService.execute(async () => {
        await new Promise(resolve => setTimeout(resolve, 30));
        return { userId: 'user-123', email: 'user@example.com' };
      });

      // 3. Check inventory
      await serviceMesh.inventoryService.execute(async () => {
        await new Promise(resolve => setTimeout(resolve, 40));
        if (Math.random() < 0.2) throw new Error('Inventory check failed');
        return { available: true };
      });

      // 4. Process payment
      await serviceMesh.paymentService.execute(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (Math.random() < 0.3) throw new Error('Payment failed');
        return { transactionId: 'txn-' + Date.now() };
      });

      // 5. Create order
      await serviceMesh.orderService.execute(async () => {
        await new Promise(resolve => setTimeout(resolve, 60));
        return { orderId, status: 'created' };
      });

      // 6. Send notification (fire and forget)
      serviceMesh.notificationService.execute(async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
        return { sent: true };
      }).catch(() => {});

      const duration = Date.now() - startTime;
      console.log(`Order ${orderId} completed in ${duration}ms`);
      return { success: true, orderId };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`Order ${orderId} failed after ${duration}ms: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Process multiple orders
  const results = [];
  for (let i = 1; i <= 20; i++) {
    const result = await processOrder(`ORD-${i}`);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Final report
  console.log('\n=== Production Summary ===');
  console.log(`Total Orders: ${results.length}`);
  console.log(`Successful: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);

  console.log('\n=== Service Health ===');
  Object.entries(serviceMesh).forEach(([name, breaker]) => {
    const metrics = breaker.getMetrics();
    console.log(`\n${name}:`);
    console.log(`  State: ${metrics.state}`);
    console.log(`  Total Calls: ${metrics.totalCalls}`);
    console.log(`  Success Rate: ${(metrics.successRate * 100).toFixed(2)}%`);
    console.log(`  Avg Response: ${metrics.avgResponseTime.toFixed(2)}ms`);
    console.log(`  Rejected: ${metrics.rejectedCalls}`);
  });
}

// Run all examples
async function runAllExamples() {
  try {
    await example1_BasicCircuitBreaker();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await example2_MultipleCircuitBreakers();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await example3_CircuitBreakerWithRetry();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await example4_FallbackStrategy();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await example5_HealthMonitoring();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await example6_CoordinatedBreakers();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await example7_DynamicThresholds();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Skip example8 (dashboard) in batch mode
    // await example8_Dashboard();

    await example9_DistributedState();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await example10_ProductionScenario();

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
  example1_BasicCircuitBreaker,
  example2_MultipleCircuitBreakers,
  example3_CircuitBreakerWithRetry,
  example4_FallbackStrategy,
  example5_HealthMonitoring,
  example6_CoordinatedBreakers,
  example7_DynamicThresholds,
  example8_Dashboard,
  example9_DistributedState,
  example10_ProductionScenario
};
