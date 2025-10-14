/**
 * Chatty I/O Anti-Pattern
 *
 * PROBLEM:
 * Making many small, individual I/O requests instead of fewer bulk requests.
 * Each request has overhead (network latency, connection setup, serialization),
 * so many small requests are much slower than a few large requests.
 *
 * SYMPTOMS:
 * - Many small database queries in loops
 * - Individual API calls for each item
 * - N+1 query problem
 * - High network overhead
 * - Poor performance under load
 *
 * SOLUTION:
 * Batch requests together, use bulk operations, implement proper data loading
 * strategies (eager loading, includes, joins).
 */

// ============================================================================
// SIMULATED DATABASE
// ============================================================================

class Database {
  constructor() {
    this.queryCount = 0;
    this.totalLatency = 0;
    this.latencyPerQuery = 50; // 50ms per query

    // Sample data
    this.users = new Map([
      [1, { id: 1, name: 'Alice Johnson', email: 'alice@example.com', departmentId: 1 }],
      [2, { id: 2, name: 'Bob Smith', email: 'bob@example.com', departmentId: 2 }],
      [3, { id: 3, name: 'Carol White', email: 'carol@example.com', departmentId: 1 }],
      [4, { id: 4, name: 'Dave Brown', email: 'dave@example.com', departmentId: 3 }],
      [5, { id: 5, name: 'Eve Davis', email: 'eve@example.com', departmentId: 2 }],
    ]);

    this.departments = new Map([
      [1, { id: 1, name: 'Engineering', location: 'Building A' }],
      [2, { id: 2, name: 'Marketing', location: 'Building B' }],
      [3, { id: 3, name: 'Sales', location: 'Building C' }],
    ]);

    this.projects = new Map([
      [1, { id: 1, name: 'Project Alpha', userId: 1 }],
      [2, { id: 2, name: 'Project Beta', userId: 1 }],
      [3, { id: 3, name: 'Project Gamma', userId: 2 }],
      [4, { id: 4, name: 'Project Delta', userId: 3 }],
      [5, { id: 5, name: 'Project Epsilon', userId: 4 }],
      [6, { id: 6, name: 'Project Zeta', userId: 5 }],
    ]);
  }

  async findUserById(id) {
    this.queryCount++;
    await this.simulateLatency();
    return this.users.get(id);
  }

  async findDepartmentById(id) {
    this.queryCount++;
    await this.simulateLatency();
    return this.departments.get(id);
  }

  async findProjectsByUserId(userId) {
    this.queryCount++;
    await this.simulateLatency();
    return Array.from(this.projects.values()).filter(p => p.userId === userId);
  }

  async findAllUsers() {
    this.queryCount++;
    await this.simulateLatency();
    return Array.from(this.users.values());
  }

  async findUsersByIds(ids) {
    this.queryCount++;
    await this.simulateLatency();
    return ids.map(id => this.users.get(id)).filter(Boolean);
  }

  async findDepartmentsByIds(ids) {
    this.queryCount++;
    await this.simulateLatency();
    return ids.map(id => this.departments.get(id)).filter(Boolean);
  }

  async findAllProjects() {
    this.queryCount++;
    await this.simulateLatency();
    return Array.from(this.projects.values());
  }

  async simulateLatency() {
    await new Promise(resolve => setTimeout(resolve, this.latencyPerQuery));
    this.totalLatency += this.latencyPerQuery;
  }

  getStats() {
    return {
      queryCount: this.queryCount,
      totalLatency: this.totalLatency,
      averageLatency: this.queryCount > 0 ? this.totalLatency / this.queryCount : 0
    };
  }

  reset() {
    this.queryCount = 0;
    this.totalLatency = 0;
  }
}

// ============================================================================
// ANTI-PATTERN: Chatty I/O
// ============================================================================

class ChattyIOService {
  constructor(database) {
    this.db = database;
  }

  // PROBLEM: N+1 Query Problem - One query to get all users,
  // then N queries to get each user's department
  async getUsersWithDepartments() {
    console.log('[ANTI-PATTERN] Loading users with departments (chatty)');
    const startTime = Date.now();

    // Query 1: Get all users
    const users = await this.db.findAllUsers();

    // PROBLEM: N additional queries - one for each user
    const usersWithDepartments = [];
    for (const user of users) {
      const department = await this.db.findDepartmentById(user.departmentId);
      usersWithDepartments.push({
        ...user,
        department
      });
    }

    const duration = Date.now() - startTime;
    const stats = this.db.getStats();

    console.log(`[ANTI-PATTERN] Loaded ${users.length} users with ${stats.queryCount} queries in ${duration}ms`);
    console.log('PROBLEM: Made separate query for each department!\n');

    return usersWithDepartments;
  }

  // PROBLEM: Multiple sequential queries that could be batched
  async getUserDetails(userId) {
    console.log(`[ANTI-PATTERN] Loading user ${userId} details (chatty)`);
    const startTime = Date.now();

    // Three separate queries
    const user = await this.db.findUserById(userId);
    const department = await this.db.findDepartmentById(user.departmentId);
    const projects = await this.db.findProjectsByUserId(userId);

    const duration = Date.now() - startTime;
    console.log(`[ANTI-PATTERN] Loaded user details in ${duration}ms with 3 separate queries`);
    console.log('PROBLEM: Could have been done more efficiently!\n');

    return { user, department, projects };
  }

  // PROBLEM: Loading related data in a loop
  async getProjectSummary() {
    console.log('[ANTI-PATTERN] Loading project summary (chatty)');
    const startTime = Date.now();

    const projects = await this.db.findAllProjects();

    // PROBLEM: One query per project to get user data
    const projectSummary = [];
    for (const project of projects) {
      const user = await this.db.findUserById(project.userId);
      projectSummary.push({
        projectName: project.name,
        ownerName: user.name,
        ownerEmail: user.email
      });
    }

    const duration = Date.now() - startTime;
    const stats = this.db.getStats();

    console.log(`[ANTI-PATTERN] Loaded ${projects.length} projects with ${stats.queryCount} queries in ${duration}ms`);
    console.log('PROBLEM: Could have batched user lookups!\n');

    return projectSummary;
  }
}

// ============================================================================
// SOLUTION: Batch Operations and Eager Loading
// ============================================================================

class BatchedIOService {
  constructor(database) {
    this.db = database;
  }

  // SOLUTION: Load departments in bulk, not one at a time
  async getUsersWithDepartments() {
    console.log('[SOLUTION] Loading users with departments (batched)');
    const startTime = Date.now();

    // Query 1: Get all users
    const users = await this.db.findAllUsers();

    // SOLUTION: Get unique department IDs and fetch in one query
    const uniqueDepartmentIds = [...new Set(users.map(u => u.departmentId))];
    const departments = await this.db.findDepartmentsByIds(uniqueDepartmentIds);

    // Create department lookup map
    const departmentMap = new Map(departments.map(d => [d.id, d]));

    // Join data in memory
    const usersWithDepartments = users.map(user => ({
      ...user,
      department: departmentMap.get(user.departmentId)
    }));

    const duration = Date.now() - startTime;
    const stats = this.db.getStats();

    console.log(`[SOLUTION] Loaded ${users.length} users with ${stats.queryCount} queries in ${duration}ms`);
    console.log('SUCCESS: Used bulk loading instead of N+1 queries!\n');

    return usersWithDepartments;
  }

  // SOLUTION: Parallel queries instead of sequential
  async getUserDetails(userId) {
    console.log(`[SOLUTION] Loading user ${userId} details (parallel)`);
    const startTime = Date.now();

    // SOLUTION: Execute all queries in parallel
    const user = await this.db.findUserById(userId);

    // Once we have user, we can fetch department and projects in parallel
    const [department, projects] = await Promise.all([
      this.db.findDepartmentById(user.departmentId),
      this.db.findProjectsByUserId(userId)
    ]);

    const duration = Date.now() - startTime;
    console.log(`[SOLUTION] Loaded user details in ${duration}ms with parallel queries`);
    console.log('SUCCESS: Reduced latency by running queries concurrently!\n');

    return { user, department, projects };
  }

  // SOLUTION: Batch load users for all projects
  async getProjectSummary() {
    console.log('[SOLUTION] Loading project summary (batched)');
    const startTime = Date.now();

    const projects = await this.db.findAllProjects();

    // SOLUTION: Get all unique user IDs and fetch in one query
    const uniqueUserIds = [...new Set(projects.map(p => p.userId))];
    const users = await this.db.findUsersByIds(uniqueUserIds);

    // Create user lookup map
    const userMap = new Map(users.map(u => [u.id, u]));

    // Join data in memory
    const projectSummary = projects.map(project => {
      const user = userMap.get(project.userId);
      return {
        projectName: project.name,
        ownerName: user.name,
        ownerEmail: user.email
      };
    });

    const duration = Date.now() - startTime;
    const stats = this.db.getStats();

    console.log(`[SOLUTION] Loaded ${projects.length} projects with ${stats.queryCount} queries in ${duration}ms`);
    console.log('SUCCESS: Batched user lookups instead of individual queries!\n');

    return projectSummary;
  }
}

// ============================================================================
// ADVANCED: DataLoader Pattern for Automatic Batching
// ============================================================================

class DataLoader {
  constructor(batchLoadFn, options = {}) {
    this.batchLoadFn = batchLoadFn;
    this.cache = options.cache !== false;
    this.cacheMap = new Map();
    this.queue = [];
    this.batchScheduled = false;
  }

  load(key) {
    // Check cache first
    if (this.cache && this.cacheMap.has(key)) {
      return Promise.resolve(this.cacheMap.get(key));
    }

    // Add to batch queue
    return new Promise((resolve, reject) => {
      this.queue.push({ key, resolve, reject });

      if (!this.batchScheduled) {
        this.batchScheduled = true;
        // Schedule batch execution for next tick
        process.nextTick(() => this.processBatch());
      }
    });
  }

  async processBatch() {
    const batch = this.queue;
    this.queue = [];
    this.batchScheduled = false;

    const keys = batch.map(item => item.key);

    try {
      const results = await this.batchLoadFn(keys);

      // Cache and resolve each result
      batch.forEach((item, index) => {
        const result = results[index];
        if (this.cache) {
          this.cacheMap.set(item.key, result);
        }
        item.resolve(result);
      });
    } catch (error) {
      // Reject all in batch
      batch.forEach(item => item.reject(error));
    }
  }

  clear() {
    this.cacheMap.clear();
  }
}

class DataLoaderService {
  constructor(database) {
    this.db = database;

    // Create data loaders for automatic batching
    this.userLoader = new DataLoader(async (userIds) => {
      return this.db.findUsersByIds(userIds);
    });

    this.departmentLoader = new DataLoader(async (deptIds) => {
      return this.db.findDepartmentsByIds(deptIds);
    });
  }

  async getUsersWithDepartments() {
    console.log('[DATALOADER] Loading users with departments (auto-batched)');
    const startTime = Date.now();

    const users = await this.db.findAllUsers();

    // Load departments - DataLoader automatically batches these
    const usersWithDepartments = await Promise.all(
      users.map(async (user) => ({
        ...user,
        department: await this.departmentLoader.load(user.departmentId)
      }))
    );

    const duration = Date.now() - startTime;
    const stats = this.db.getStats();

    console.log(`[DATALOADER] Loaded ${users.length} users with ${stats.queryCount} queries in ${duration}ms`);
    console.log('SUCCESS: DataLoader automatically batched department lookups!\n');

    return usersWithDepartments;
  }
}

// ============================================================================
// DEMONSTRATION
// ============================================================================

async function demonstrateChattyIO() {
  console.log('='.repeat(80));
  console.log('CHATTY I/O ANTI-PATTERN DEMONSTRATION');
  console.log('='.repeat(80));

  console.log('\n--- ANTI-PATTERN: Chatty I/O ---\n');
  let db = new Database();
  const chattyService = new ChattyIOService(db);

  await chattyService.getUsersWithDepartments();
  db.reset();

  await chattyService.getUserDetails(1);
  db.reset();

  await chattyService.getProjectSummary();
  const chattyStats = db.getStats();
  console.log(`Total queries (chatty): ${chattyStats.queryCount}`);
  console.log(`Total latency (chatty): ${chattyStats.totalLatency}ms\n`);

  console.log('\n--- SOLUTION: Batched I/O ---\n');
  db = new Database();
  const batchedService = new BatchedIOService(db);

  await batchedService.getUsersWithDepartments();
  db.reset();

  await batchedService.getUserDetails(1);
  db.reset();

  await batchedService.getProjectSummary();
  const batchedStats = db.getStats();
  console.log(`Total queries (batched): ${batchedStats.queryCount}`);
  console.log(`Total latency (batched): ${batchedStats.totalLatency}ms\n`);

  console.log('\n--- SOLUTION: DataLoader Pattern ---\n');
  db = new Database();
  const dataLoaderService = new DataLoaderService(db);

  await dataLoaderService.getUsersWithDepartments();
  const dataLoaderStats = db.getStats();
  console.log(`Total queries (DataLoader): ${dataLoaderStats.queryCount}`);
  console.log(`Total latency (DataLoader): ${dataLoaderStats.totalLatency}ms\n`);

  console.log('='.repeat(80));
  console.log('KEY TAKEAWAYS:');
  console.log('='.repeat(80));
  console.log('1. Avoid N+1 query problems - batch related data loading');
  console.log('2. Use bulk operations instead of individual queries');
  console.log('3. Execute independent queries in parallel');
  console.log('4. Consider DataLoader pattern for automatic batching');
  console.log('5. Use eager loading / includes in ORMs');
  console.log('6. Monitor query counts in production');
  console.log('='.repeat(80));
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  Database,
  ChattyIOService,
  BatchedIOService,
  DataLoader,
  DataLoaderService,
  demonstrateChattyIO
};

// Run demonstration if executed directly
if (require.main === module) {
  demonstrateChattyIO().catch(console.error);
}
