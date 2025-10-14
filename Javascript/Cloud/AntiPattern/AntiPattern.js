/**
 * Cloud Anti-Patterns
 *
 * Common mistakes and bad practices in cloud architecture that lead to
 * poor performance, high costs, security issues, and maintenance problems.
 *
 * This module demonstrates various cloud anti-patterns and their proper solutions.
 *
 * Categories:
 * - Performance Anti-Patterns: Chatty I/O, Synchronous I/O, No Caching
 * - Scalability Anti-Patterns: Monolithic Persistence, Improper Instantiation
 * - Reliability Anti-Patterns: Retry Storm, Cascading Failures
 * - Cost Anti-Patterns: Over-Provisioning, Ignoring Cloud Economics
 * - Security Anti-Patterns: Hardcoded Secrets, No Encryption
 */

/**
 * ANTI-PATTERN 1: Chatty I/O
 * Making many small requests instead of fewer larger requests
 */
class ChattyIOAntiPattern {
  constructor() {
    this.database = new Map([
      ['user1', { name: 'Alice', email: 'alice@example.com', age: 30 }],
      ['user2', { name: 'Bob', email: 'bob@example.com', age: 25 }],
      ['user3', { name: 'Charlie', email: 'charlie@example.com', age: 35 }]
    ]);
  }

  /**
   * ANTI-PATTERN: Multiple round trips
   */
  async getUsersIndividually(userIds) {
    const users = [];

    for (const id of userIds) {
      await this.simulateNetworkDelay(50);
      const user = this.database.get(id);
      if (user) {
        users.push(user);
      }
    }

    return users;
  }

  /**
   * SOLUTION: Batch requests
   */
  async getUsersBatch(userIds) {
    await this.simulateNetworkDelay(50);

    return userIds
      .map(id => this.database.get(id))
      .filter(user => user !== undefined);
  }

  async simulateNetworkDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async demonstrate() {
    console.log('\n=== ANTI-PATTERN: Chatty I/O ===');

    const userIds = ['user1', 'user2', 'user3'];

    const antiPatternStart = Date.now();
    await this.getUsersIndividually(userIds);
    const antiPatternTime = Date.now() - antiPatternStart;
    console.log(`Anti-Pattern (3 requests): ${antiPatternTime}ms`);

    const solutionStart = Date.now();
    await this.getUsersBatch(userIds);
    const solutionTime = Date.now() - solutionStart;
    console.log(`Solution (1 request): ${solutionTime}ms`);
    console.log(`Improvement: ${antiPatternTime - solutionTime}ms faster`);
  }
}

/**
 * ANTI-PATTERN 2: No Caching
 * Repeatedly fetching the same data without caching
 */
class NoCachingAntiPattern {
  constructor() {
    this.database = new Map([
      ['config', { theme: 'dark', language: 'en', region: 'us' }]
    ]);
    this.cache = new Map();
    this.cacheTTL = 60000;
  }

  /**
   * ANTI-PATTERN: No caching
   */
  async getConfigWithoutCache() {
    await this.simulateNetworkDelay(100);
    return this.database.get('config');
  }

  /**
   * SOLUTION: With caching
   */
  async getConfigWithCache() {
    const cached = this.cache.get('config');

    if (cached && Date.now() < cached.expiry) {
      return cached.value;
    }

    await this.simulateNetworkDelay(100);
    const config = this.database.get('config');

    this.cache.set('config', {
      value: config,
      expiry: Date.now() + this.cacheTTL
    });

    return config;
  }

  async simulateNetworkDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async demonstrate() {
    console.log('\n=== ANTI-PATTERN: No Caching ===');

    const antiPatternStart = Date.now();
    for (let i = 0; i < 10; i++) {
      await this.getConfigWithoutCache();
    }
    const antiPatternTime = Date.now() - antiPatternStart;
    console.log(`Anti-Pattern (10 requests, no cache): ${antiPatternTime}ms`);

    const solutionStart = Date.now();
    for (let i = 0; i < 10; i++) {
      await this.getConfigWithCache();
    }
    const solutionTime = Date.now() - solutionStart;
    console.log(`Solution (1 DB hit + 9 cache hits): ${solutionTime}ms`);
    console.log(`Improvement: ${antiPatternTime - solutionTime}ms faster`);
  }
}

/**
 * ANTI-PATTERN 3: Synchronous I/O
 * Blocking operations that could be asynchronous
 */
class SynchronousIOAntiPattern {
  /**
   * ANTI-PATTERN: Sequential synchronous operations
   */
  async processTasksSequentially(tasks) {
    const results = [];

    for (const task of tasks) {
      const result = await this.processTask(task);
      results.push(result);
    }

    return results;
  }

  /**
   * SOLUTION: Parallel asynchronous operations
   */
  async processTasksParallel(tasks) {
    return Promise.all(tasks.map(task => this.processTask(task)));
  }

  async processTask(task) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return { task, processed: true };
  }

  async demonstrate() {
    console.log('\n=== ANTI-PATTERN: Synchronous I/O ===');

    const tasks = [1, 2, 3, 4, 5];

    const antiPatternStart = Date.now();
    await this.processTasksSequentially(tasks);
    const antiPatternTime = Date.now() - antiPatternStart;
    console.log(`Anti-Pattern (sequential): ${antiPatternTime}ms`);

    const solutionStart = Date.now();
    await this.processTasksParallel(tasks);
    const solutionTime = Date.now() - solutionStart;
    console.log(`Solution (parallel): ${solutionTime}ms`);
    console.log(`Improvement: ${antiPatternTime - solutionTime}ms faster`);
  }
}

/**
 * ANTI-PATTERN 4: Retry Storm
 * Aggressive retries that overwhelm failing services
 */
class RetryStormAntiPattern {
  constructor() {
    this.failureCount = 0;
    this.requestCount = 0;
  }

  /**
   * ANTI-PATTERN: Immediate aggressive retries
   */
  async makeRequestWithAggressiveRetry() {
    const maxRetries = 10;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      this.requestCount++;

      try {
        return await this.simulateFailingService();
      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw error;
        }
      }
    }
  }

  /**
   * SOLUTION: Exponential backoff with jitter
   */
  async makeRequestWithExponentialBackoff() {
    const maxRetries = 10;
    const baseDelay = 100;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      this.requestCount++;

      try {
        return await this.simulateFailingService();
      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw error;
        }

        const delay = Math.min(
          baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
          10000
        );

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async simulateFailingService() {
    this.failureCount++;

    if (Math.random() < 0.9) {
      throw new Error('Service temporarily unavailable');
    }

    return { success: true };
  }

  async demonstrate() {
    console.log('\n=== ANTI-PATTERN: Retry Storm ===');

    this.requestCount = 0;
    this.failureCount = 0;

    try {
      const antiPatternStart = Date.now();
      await this.makeRequestWithAggressiveRetry();
      const antiPatternTime = Date.now() - antiPatternStart;
      const antiPatternRequests = this.requestCount;

      this.requestCount = 0;
      this.failureCount = 0;

      const solutionStart = Date.now();
      await this.makeRequestWithExponentialBackoff();
      const solutionTime = Date.now() - solutionStart;
      const solutionRequests = this.requestCount;

      console.log(`Anti-Pattern: ${antiPatternRequests} requests in ${antiPatternTime}ms`);
      console.log(`Solution: ${solutionRequests} requests in ${solutionTime}ms`);
      console.log('Solution prevents overwhelming the failing service');
    } catch (error) {
      console.log('Both approaches eventually failed, but solution was gentler');
    }
  }
}

/**
 * ANTI-PATTERN 5: Monolithic Persistence
 * Using a single database for everything
 */
class MonolithicPersistenceAntiPattern {
  /**
   * ANTI-PATTERN: Single database for all data types
   */
  useSingleDatabase() {
    return {
      type: 'Single SQL Database',
      stores: ['User Profiles', 'Session Data', 'Product Catalog', 'Analytics', 'File Metadata'],
      problems: [
        'Poor performance for different access patterns',
        'Difficult to scale individual components',
        'One size fits all approach',
        'Single point of failure'
      ]
    };
  }

  /**
   * SOLUTION: Polyglot persistence
   */
  usePolyglotPersistence() {
    return {
      databases: [
        { type: 'SQL Database', stores: ['User Profiles', 'Product Catalog'], reason: 'ACID transactions' },
        { type: 'Redis', stores: ['Session Data', 'Cache'], reason: 'Fast access' },
        { type: 'MongoDB', stores: ['Analytics', 'Logs'], reason: 'Flexible schema' },
        { type: 'S3', stores: ['File Storage'], reason: 'Object storage' }
      ],
      benefits: [
        'Optimized for each use case',
        'Independent scaling',
        'Better performance',
        'Fault isolation'
      ]
    };
  }

  demonstrate() {
    console.log('\n=== ANTI-PATTERN: Monolithic Persistence ===');

    console.log('\nAnti-Pattern:');
    const antiPattern = this.useSingleDatabase();
    console.log(`Type: ${antiPattern.type}`);
    console.log(`Stores: ${antiPattern.stores.join(', ')}`);
    console.log('Problems:');
    antiPattern.problems.forEach(p => console.log(`  - ${p}`));

    console.log('\nSolution:');
    const solution = this.usePolyglotPersistence();
    console.log('Databases:');
    solution.databases.forEach(db => {
      console.log(`  ${db.type}: ${db.stores.join(', ')} (${db.reason})`);
    });
    console.log('Benefits:');
    solution.benefits.forEach(b => console.log(`  - ${b}`));
  }
}

/**
 * ANTI-PATTERN 6: Hardcoded Configuration
 * Hardcoding values that should be configurable
 */
class HardcodedConfigAntiPattern {
  /**
   * ANTI-PATTERN: Hardcoded values
   */
  getHardcodedConfig() {
    return {
      apiUrl: 'https://api.production.example.com',
      databaseHost: '10.0.1.50',
      maxConnections: 100,
      timeout: 5000,
      problems: [
        'Cannot change without redeployment',
        'Different values for different environments',
        'Security risk if credentials are hardcoded',
        'Difficult to manage at scale'
      ]
    };
  }

  /**
   * SOLUTION: External configuration
   */
  getExternalConfig() {
    if (!process.env.API_URL) {
      throw new Error('API_URL environment variable is required');
    }
    if (!process.env.DATABASE_HOST) {
      throw new Error('DATABASE_HOST environment variable is required');
    }

    return {
      apiUrl: process.env.API_URL,
      databaseHost: process.env.DATABASE_HOST,
      maxConnections: parseInt(process.env.MAX_CONNECTIONS || '100', 10),
      timeout: parseInt(process.env.TIMEOUT || '5000', 10),
      benefits: [
        'Environment-specific configuration',
        'No redeployment needed for config changes',
        'Secrets managed securely',
        'Centralized configuration management'
      ]
    };
  }

  demonstrate() {
    console.log('\n=== ANTI-PATTERN: Hardcoded Configuration ===');

    console.log('\nAnti-Pattern:');
    const antiPattern = this.getHardcodedConfig();
    console.log(`API URL: ${antiPattern.apiUrl}`);
    console.log(`Database: ${antiPattern.databaseHost}`);
    console.log('Problems:');
    antiPattern.problems.forEach(p => console.log(`  - ${p}`));

    console.log('\nSolution:');
    console.log('Use environment variables:');
    console.log('  API_URL=https://api.example.com');
    console.log('  DATABASE_HOST=db.example.com');
    console.log('  MAX_CONNECTIONS=100');
    console.log('  TIMEOUT=5000');
  }
}

/**
 * ANTI-PATTERN 7: No Circuit Breaker
 * Not protecting against cascading failures
 */
class NoCircuitBreakerAntiPattern {
  constructor() {
    this.serviceDown = true;
    this.callCount = 0;
  }

  /**
   * ANTI-PATTERN: No protection
   */
  async callWithoutCircuitBreaker() {
    this.callCount++;
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (this.serviceDown) {
      throw new Error('Service unavailable');
    }

    return { success: true };
  }

  /**
   * SOLUTION: Circuit breaker pattern
   */
  async callWithCircuitBreaker() {
    if (this.circuitOpen) {
      throw new Error('Circuit breaker is open');
    }

    try {
      this.callCount++;
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (this.serviceDown) {
        throw new Error('Service unavailable');
      }

      return { success: true };
    } catch (error) {
      this.circuitOpen = true;
      throw error;
    }
  }

  async demonstrate() {
    console.log('\n=== ANTI-PATTERN: No Circuit Breaker ===');

    this.callCount = 0;
    const antiPatternStart = Date.now();

    try {
      await Promise.all([
        this.callWithoutCircuitBreaker(),
        this.callWithoutCircuitBreaker(),
        this.callWithoutCircuitBreaker()
      ]);
    } catch (error) {
      const antiPatternTime = Date.now() - antiPatternStart;
      console.log(`Anti-Pattern: ${this.callCount} calls, ${antiPatternTime}ms wasted`);
    }

    this.callCount = 0;
    this.circuitOpen = false;
    const solutionStart = Date.now();

    try {
      await this.callWithCircuitBreaker();
    } catch (error) {
      this.circuitOpen = true;
    }

    try {
      await this.callWithCircuitBreaker();
      await this.callWithCircuitBreaker();
    } catch (error) {
      const solutionTime = Date.now() - solutionStart;
      console.log(`Solution: ${this.callCount} call, ${solutionTime}ms (circuit opened after first failure)`);
      console.log('Circuit breaker prevents wasting resources on known failures');
    }
  }
}

/**
 * Main Anti-Pattern demonstrator
 */
class AntiPattern {
  static async demonstrateAll() {
    console.log('='.repeat(80));
    console.log('CLOUD ANTI-PATTERNS DEMONSTRATION');
    console.log('='.repeat(80));

    const chattyIO = new ChattyIOAntiPattern();
    await chattyIO.demonstrate();

    const noCaching = new NoCachingAntiPattern();
    await noCaching.demonstrate();

    const syncIO = new SynchronousIOAntiPattern();
    await syncIO.demonstrate();

    const retryStorm = new RetryStormAntiPattern();
    await retryStorm.demonstrate();

    const monolithicPersistence = new MonolithicPersistenceAntiPattern();
    monolithicPersistence.demonstrate();

    const hardcodedConfig = new HardcodedConfigAntiPattern();
    hardcodedConfig.demonstrate();

    const noCircuitBreaker = new NoCircuitBreakerAntiPattern();
    await noCircuitBreaker.demonstrate();

    console.log('\n' + '='.repeat(80));
    console.log('KEY TAKEAWAYS');
    console.log('='.repeat(80));
    console.log('1. Batch requests to reduce network round trips');
    console.log('2. Cache frequently accessed data');
    console.log('3. Use asynchronous I/O for parallel operations');
    console.log('4. Implement exponential backoff for retries');
    console.log('5. Use polyglot persistence for different data types');
    console.log('6. Externalize configuration');
    console.log('7. Use circuit breakers to prevent cascading failures');
    console.log('='.repeat(80));
  }

  static getChattyIO() {
    return new ChattyIOAntiPattern();
  }

  static getNoCaching() {
    return new NoCachingAntiPattern();
  }

  static getSynchronousIO() {
    return new SynchronousIOAntiPattern();
  }

  static getRetryStorm() {
    return new RetryStormAntiPattern();
  }

  static getMonolithicPersistence() {
    return new MonolithicPersistenceAntiPattern();
  }

  static getHardcodedConfig() {
    return new HardcodedConfigAntiPattern();
  }

  static getNoCircuitBreaker() {
    return new NoCircuitBreakerAntiPattern();
  }
}

module.exports = {
  AntiPattern,
  ChattyIOAntiPattern,
  NoCachingAntiPattern,
  SynchronousIOAntiPattern,
  RetryStormAntiPattern,
  MonolithicPersistenceAntiPattern,
  HardcodedConfigAntiPattern,
  NoCircuitBreakerAntiPattern
};

if (require.main === module) {
  AntiPattern.demonstrateAll().catch(console.error);
}
