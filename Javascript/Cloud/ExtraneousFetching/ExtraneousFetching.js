/**
 * Extraneous Fetching Anti-Pattern
 *
 * PROBLEM:
 * Retrieving more data than necessary from the database or API. This wastes
 * bandwidth, memory, processing time, and can significantly slow down applications.
 *
 * SYMPTOMS:
 * - Selecting all columns when only few are needed (SELECT *)
 * - Loading entire collections when only counts are needed
 * - Fetching large BLOBs unnecessarily
 * - Not using pagination
 * - Loading full entities when only IDs are needed
 *
 * SOLUTION:
 * Use projection/selection to fetch only required fields, implement pagination,
 * use aggregation queries, and lazy load large data.
 */

// ============================================================================
// SIMULATED DATABASE
// ============================================================================

class ProductDatabase {
  constructor() {
    this.queryCount = 0;
    this.bytesTransferred = 0;

    // Simulated products with large image data
    this.products = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `Product ${i + 1}`,
      description: `This is a detailed description for product ${i + 1}. `.repeat(10),
      price: Math.floor(Math.random() * 10000) / 100,
      category: ['Electronics', 'Clothing', 'Books', 'Home'][i % 4],
      stock: Math.floor(Math.random() * 100),
      imageData: 'x'.repeat(100000), // 100KB image
      specifications: JSON.stringify({
        weight: Math.random() * 10,
        dimensions: { length: 10, width: 5, height: 3 },
        materials: ['plastic', 'metal', 'fabric']
      }),
      reviews: Array.from({ length: 50 }, (_, j) => ({
        userId: j + 1,
        rating: Math.floor(Math.random() * 5) + 1,
        comment: `Review comment ${j + 1}`.repeat(5)
      })),
      metadata: {
        created: new Date(2020, 0, 1),
        updated: new Date(),
        tags: ['tag1', 'tag2', 'tag3']
      }
    }));
  }

  // ANTI-PATTERN: Fetch everything
  async findAll() {
    this.queryCount++;
    const dataSize = JSON.stringify(this.products).length;
    this.bytesTransferred += dataSize;
    console.log(`  Query: SELECT * FROM products (${(dataSize / 1024 / 1024).toFixed(2)}MB transferred)`);
    return this.products;
  }

  // SOLUTION: Fetch with projection
  async findAllProjected(fields) {
    this.queryCount++;
    const projected = this.products.map(product => {
      const result = {};
      fields.forEach(field => {
        result[field] = product[field];
      });
      return result;
    });
    const dataSize = JSON.stringify(projected).length;
    this.bytesTransferred += dataSize;
    console.log(`  Query: SELECT ${fields.join(', ')} FROM products (${(dataSize / 1024).toFixed(2)}KB transferred)`);
    return projected;
  }

  // SOLUTION: Pagination
  async findPaginated(page, pageSize, fields = null) {
    this.queryCount++;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    let results = this.products.slice(start, end);

    if (fields) {
      results = results.map(product => {
        const result = {};
        fields.forEach(field => {
          result[field] = product[field];
        });
        return result;
      });
    }

    const dataSize = JSON.stringify(results).length;
    this.bytesTransferred += dataSize;
    console.log(`  Query: SELECT ${fields ? fields.join(', ') : '*'} FROM products LIMIT ${pageSize} OFFSET ${start} (${(dataSize / 1024).toFixed(2)}KB transferred)`);
    return {
      data: results,
      page,
      pageSize,
      totalCount: this.products.length,
      totalPages: Math.ceil(this.products.length / pageSize)
    };
  }

  // SOLUTION: Count only
  async count() {
    this.queryCount++;
    const dataSize = 8; // Just a number
    this.bytesTransferred += dataSize;
    console.log(`  Query: SELECT COUNT(*) FROM products (${dataSize} bytes transferred)`);
    return this.products.length;
  }

  // SOLUTION: Aggregation
  async aggregate(groupBy, aggregateField) {
    this.queryCount++;
    const grouped = {};

    this.products.forEach(product => {
      const key = product[groupBy];
      if (!grouped[key]) {
        grouped[key] = { count: 0, total: 0 };
      }
      grouped[key].count++;
      grouped[key].total += product[aggregateField];
    });

    const dataSize = JSON.stringify(grouped).length;
    this.bytesTransferred += dataSize;
    console.log(`  Query: SELECT ${groupBy}, COUNT(*), SUM(${aggregateField}) FROM products GROUP BY ${groupBy} (${dataSize} bytes transferred)`);
    return grouped;
  }

  getStats() {
    return {
      queryCount: this.queryCount,
      bytesTransferred: this.bytesTransferred,
      megabytesTransferred: (this.bytesTransferred / 1024 / 1024).toFixed(2)
    };
  }

  reset() {
    this.queryCount = 0;
    this.bytesTransferred = 0;
  }
}

// ============================================================================
// ANTI-PATTERN: Extraneous Fetching
// ============================================================================

class ExtraneousFetchingService {
  constructor(database) {
    this.db = database;
  }

  // PROBLEM: Fetch all data when only showing a list
  async getProductList() {
    console.log('[ANTI-PATTERN] Loading product list with all data');

    // PROBLEM: SELECT * fetches everything including huge images and reviews
    const products = await this.db.findAll();

    // Only using id, name, and price for the list view
    const productList = products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price
    }));

    console.log(`PROBLEM: Fetched ${products.length} products with ALL fields, used only 3!\n`);
    return productList;
  }

  // PROBLEM: No pagination - load everything
  async getAllProducts() {
    console.log('[ANTI-PATTERN] Loading all products without pagination');

    const products = await this.db.findAll();

    console.log(`PROBLEM: Loaded all ${products.length} products at once!\n`);
    return products;
  }

  // PROBLEM: Fetch all products just to count them
  async getProductCount() {
    console.log('[ANTI-PATTERN] Counting products by fetching all data');

    const products = await this.db.findAll();
    const count = products.length;

    console.log(`PROBLEM: Fetched all data just to count: ${count} products!\n`);
    return count;
  }

  // PROBLEM: Fetch everything to calculate category totals
  async getCategorySummary() {
    console.log('[ANTI-PATTERN] Getting category summary by fetching all data');

    const products = await this.db.findAll();

    // Calculate summary client-side
    const summary = {};
    products.forEach(p => {
      if (!summary[p.category]) {
        summary[p.category] = { count: 0, totalValue: 0 };
      }
      summary[p.category].count++;
      summary[p.category].totalValue += p.price * p.stock;
    });

    console.log(`PROBLEM: Fetched all products to calculate category summary!\n`);
    return summary;
  }
}

// ============================================================================
// SOLUTION: Selective Fetching
// ============================================================================

class SelectiveFetchingService {
  constructor(database) {
    this.db = database;
  }

  // SOLUTION: Use projection to fetch only needed fields
  async getProductList() {
    console.log('[SOLUTION] Loading product list with projection');

    // Only select the fields we need
    const products = await this.db.findAllProjected(['id', 'name', 'price']);

    console.log(`SUCCESS: Fetched ${products.length} products with only required fields!\n`);
    return products;
  }

  // SOLUTION: Use pagination
  async getProducts(page = 1, pageSize = 10) {
    console.log(`[SOLUTION] Loading products with pagination (page ${page}, size ${pageSize})`);

    const result = await this.db.findPaginated(page, pageSize, ['id', 'name', 'price', 'category']);

    console.log(`SUCCESS: Fetched page ${result.page} of ${result.totalPages} (${result.data.length} items)!\n`);
    return result;
  }

  // SOLUTION: Use count query
  async getProductCount() {
    console.log('[SOLUTION] Counting products with COUNT query');

    const count = await this.db.count();

    console.log(`SUCCESS: Got count efficiently: ${count} products!\n`);
    return count;
  }

  // SOLUTION: Use aggregation query
  async getCategorySummary() {
    console.log('[SOLUTION] Getting category summary with aggregation');

    const summary = await this.db.aggregate('category', 'price');

    console.log(`SUCCESS: Got category summary with single aggregation query!\n`);
    return summary;
  }

  // SOLUTION: Lazy loading - fetch details only when needed
  async getProductDetails(productId) {
    console.log('[SOLUTION] Loading product details with lazy loading');

    // First, load basic info
    const basicInfo = await this.db.findPaginated(
      Math.ceil(productId / 10),
      1,
      ['id', 'name', 'price', 'category', 'stock']
    );

    // Later, if needed, load heavy data separately
    // const fullDetails = await this.db.findById(productId); // Would fetch everything

    console.log(`SUCCESS: Loaded basic info first, can load more on demand!\n`);
    return basicInfo.data[0];
  }
}

// ============================================================================
// ADVANCED: Smart Data Loading Strategy
// ============================================================================

class SmartDataLoader {
  constructor(database) {
    this.db = database;
    this.cache = new Map();
  }

  async loadList(options = {}) {
    const {
      page = 1,
      pageSize = 20,
      fields = ['id', 'name', 'price'],
      category = null
    } = options;

    console.log('[SMART] Loading with intelligent strategy');

    // Use projection and pagination
    const result = await this.db.findPaginated(page, pageSize, fields);

    // Cache for quick access
    result.data.forEach(item => {
      this.cache.set(item.id, item);
    });

    return result;
  }

  async loadSummary() {
    console.log('[SMART] Loading summary with optimal strategy');

    // Use aggregation for statistics
    const categoryStats = await this.db.aggregate('category', 'price');

    // Use count for total
    const total = await this.db.count();

    return {
      total,
      byCategory: categoryStats
    };
  }

  async prefetchCommonData() {
    console.log('[SMART] Prefetching commonly accessed data');

    // Load first page with minimal fields for quick display
    const firstPage = await this.db.findPaginated(1, 20, ['id', 'name', 'price', 'category']);

    // Cache it
    firstPage.data.forEach(item => {
      this.cache.set(item.id, item);
    });

    return firstPage;
  }

  getFromCache(id) {
    return this.cache.get(id);
  }
}

// ============================================================================
// DEMONSTRATION
// ============================================================================

async function demonstrateExtraneousFetching() {
  console.log('='.repeat(80));
  console.log('EXTRANEOUS FETCHING ANTI-PATTERN DEMONSTRATION');
  console.log('='.repeat(80));

  console.log('\n--- ANTI-PATTERN: Fetching Too Much Data ---\n');
  let db = new ProductDatabase();
  const extraneousService = new ExtraneousFetchingService(db);

  await extraneousService.getProductList();
  await extraneousService.getAllProducts();
  await extraneousService.getProductCount();
  await extraneousService.getCategorySummary();

  const extraneousStats = db.getStats();
  console.log('Anti-Pattern Statistics:');
  console.log(`  Total Queries: ${extraneousStats.queryCount}`);
  console.log(`  Data Transferred: ${extraneousStats.megabytesTransferred}MB`);
  console.log('  PROBLEM: Wasted bandwidth and processing!\n');

  console.log('\n--- SOLUTION: Selective Fetching ---\n');
  db = new ProductDatabase();
  const selectiveService = new SelectiveFetchingService(db);

  await selectiveService.getProductList();
  await selectiveService.getProducts(1, 10);
  await selectiveService.getProductCount();
  await selectiveService.getCategorySummary();
  await selectiveService.getProductDetails(1);

  const selectiveStats = db.getStats();
  console.log('Solution Statistics:');
  console.log(`  Total Queries: ${selectiveStats.queryCount}`);
  console.log(`  Data Transferred: ${selectiveStats.megabytesTransferred}MB`);
  console.log('  SUCCESS: Minimized data transfer!\n');

  console.log('\n--- SOLUTION: Smart Data Loading ---\n');
  db = new ProductDatabase();
  const smartLoader = new SmartDataLoader(db);

  await smartLoader.loadList({ page: 1, pageSize: 10 });
  await smartLoader.loadSummary();
  await smartLoader.prefetchCommonData();

  const smartStats = db.getStats();
  console.log('Smart Loading Statistics:');
  console.log(`  Total Queries: ${smartStats.queryCount}`);
  console.log(`  Data Transferred: ${smartStats.megabytesTransferred}MB\n`);

  console.log('='.repeat(80));
  console.log('COMPARISON:');
  console.log('='.repeat(80));
  console.log(`Anti-Pattern:     ${extraneousStats.megabytesTransferred}MB transferred`);
  console.log(`Selective:        ${selectiveStats.megabytesTransferred}MB transferred`);
  console.log(`Smart:            ${smartStats.megabytesTransferred}MB transferred`);
  console.log(`Savings:          ${(((extraneousStats.bytesTransferred - selectiveStats.bytesTransferred) / extraneousStats.bytesTransferred) * 100).toFixed(1)}% reduction`);

  console.log('\n' + '='.repeat(80));
  console.log('KEY TAKEAWAYS:');
  console.log('='.repeat(80));
  console.log('1. Use SELECT with specific fields, avoid SELECT *');
  console.log('2. Implement pagination for large datasets');
  console.log('3. Use COUNT queries instead of fetching all records');
  console.log('4. Use aggregation queries for summaries');
  console.log('5. Implement lazy loading for heavy data (images, BLOBs)');
  console.log('6. Consider caching frequently accessed data');
  console.log('7. Monitor data transfer in production');
  console.log('='.repeat(80));
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  ProductDatabase,
  ExtraneousFetchingService,
  SelectiveFetchingService,
  SmartDataLoader,
  demonstrateExtraneousFetching
};

// Run demonstration if executed directly
if (require.main === module) {
  demonstrateExtraneousFetching().catch(console.error);
}
