/**
 * Anti-Corruption Layer Pattern
 *
 * PROBLEM:
 * Direct integration with legacy or external systems can corrupt your domain model
 * with their concepts, data structures, and terminology. This creates tight coupling
 * and makes your system dependent on the external system's design decisions.
 *
 * SYMPTOMS:
 * - Domain model polluted with external concepts
 * - Tight coupling to external systems
 * - Difficulty adapting to external system changes
 * - Business logic mixed with integration logic
 *
 * SOLUTION:
 * Create a layer that translates between external systems and your domain model,
 * isolating your system from external influences.
 */

// ============================================================================
// EXTERNAL LEGACY SYSTEM (Simulated)
// ============================================================================

class LegacyInventorySystem {
  constructor() {
    this.items = new Map([
      ['ITM001', { item_cd: 'ITM001', item_nm: 'Widget A', qty_on_hnd: 100, unit_prc: 10.50, stat_cd: 'A' }],
      ['ITM002', { item_cd: 'ITM002', item_nm: 'Widget B', qty_on_hnd: 50, unit_prc: 25.00, stat_cd: 'A' }],
      ['ITM003', { item_cd: 'ITM003', item_nm: 'Widget C', qty_on_hnd: 0, unit_prc: 15.75, stat_cd: 'D' }],
    ]);
  }

  get_item_by_cd(item_cd) {
    const item = this.items.get(item_cd);
    if (!item) {
      return { error_cd: 'NOTFOUND', error_msg: 'Item not found in system' };
    }
    return item;
  }

  upd_item_qty(item_cd, qty_chg, trans_typ) {
    const item = this.items.get(item_cd);
    if (!item) {
      return { error_cd: 'NOTFOUND', error_msg: 'Item not found' };
    }

    if (item.stat_cd === 'D') {
      return { error_cd: 'INACTIVE', error_msg: 'Item is discontinued' };
    }

    const new_qty = trans_typ === 'ADD' ? item.qty_on_hnd + qty_chg : item.qty_on_hnd - qty_chg;

    if (new_qty < 0) {
      return { error_cd: 'INSUFFICIENT', error_msg: 'Not enough quantity' };
    }

    item.qty_on_hnd = new_qty;
    return { success_cd: 'OK', item_cd: item.item_cd, new_qty_on_hnd: new_qty };
  }

  get_all_items() {
    return Array.from(this.items.values());
  }
}

// ============================================================================
// ANTI-PATTERN: Direct Integration with Legacy System
// ============================================================================

class DirectIntegrationService {
  constructor() {
    this.legacySystem = new LegacyInventorySystem();
  }

  // PROBLEM: Exposing legacy structure directly to domain
  getProduct(itemCode) {
    console.log('[ANTI-PATTERN] Getting product directly from legacy system');
    const item = this.legacySystem.get_item_by_cd(itemCode);

    // PROBLEM: Domain code must understand legacy error handling
    if (item.error_cd) {
      throw new Error(item.error_msg);
    }

    // PROBLEM: Returning legacy structure directly
    return item;
  }

  // PROBLEM: Business logic mixed with legacy system details
  purchaseProduct(itemCode, quantity) {
    console.log('[ANTI-PATTERN] Purchasing product through direct integration');
    const item = this.legacySystem.get_item_by_cd(itemCode);

    if (item.error_cd) {
      throw new Error(item.error_msg);
    }

    // PROBLEM: Domain must know about stat_cd and its meaning
    if (item.stat_cd !== 'A') {
      throw new Error('Product not available');
    }

    // PROBLEM: Domain must know about trans_typ codes
    const result = this.legacySystem.upd_item_qty(itemCode, quantity, 'SUB');

    if (result.error_cd) {
      throw new Error(result.error_msg);
    }

    // PROBLEM: Calculating with legacy field names
    return {
      item_cd: item.item_cd,
      item_nm: item.item_nm,
      qty: quantity,
      unit_prc: item.unit_prc,
      total: quantity * item.unit_prc
    };
  }

  // PROBLEM: Legacy concepts leak into domain
  getAllActiveItems() {
    console.log('[ANTI-PATTERN] Getting all items with legacy filter');
    const items = this.legacySystem.get_all_items();
    // PROBLEM: Domain must understand stat_cd values
    return items.filter(item => item.stat_cd === 'A');
  }
}

// ============================================================================
// DOMAIN MODEL (Clean)
// ============================================================================

class Product {
  constructor(id, name, price, quantityAvailable, isActive) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.quantityAvailable = quantityAvailable;
    this.isActive = isActive;
  }

  canPurchase(quantity) {
    return this.isActive && this.quantityAvailable >= quantity;
  }

  calculateTotal(quantity) {
    return this.price * quantity;
  }
}

class PurchaseOrder {
  constructor(product, quantity) {
    this.orderId = this.generateOrderId();
    this.product = product;
    this.quantity = quantity;
    this.total = product.calculateTotal(quantity);
    this.timestamp = new Date();
  }

  generateOrderId() {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// SOLUTION: Anti-Corruption Layer
// ============================================================================

class LegacySystemAdapter {
  constructor(legacySystem) {
    this.legacySystem = legacySystem;
  }

  // Translate legacy item to domain Product
  toDomainProduct(legacyItem) {
    if (legacyItem.error_cd) {
      return null;
    }

    return new Product(
      legacyItem.item_cd,
      legacyItem.item_nm,
      legacyItem.unit_prc,
      legacyItem.qty_on_hnd,
      legacyItem.stat_cd === 'A'
    );
  }

  // Translate legacy error to domain error
  translateError(legacyResult) {
    const errorMap = {
      'NOTFOUND': 'ProductNotFoundError',
      'INACTIVE': 'ProductNotAvailableError',
      'INSUFFICIENT': 'InsufficientStockError'
    };

    const errorType = errorMap[legacyResult.error_cd] || 'UnknownError';
    const error = new Error(legacyResult.error_msg);
    error.name = errorType;
    return error;
  }

  // Translate domain request to legacy format
  toLegacyTransactionType(operation) {
    const typeMap = {
      'purchase': 'SUB',
      'restock': 'ADD',
      'return': 'ADD'
    };
    return typeMap[operation] || 'SUB';
  }
}

class ProductRepository {
  constructor() {
    this.legacySystem = new LegacyInventorySystem();
    this.adapter = new LegacySystemAdapter(this.legacySystem);
  }

  // Clean domain interface - no legacy concepts
  async findById(productId) {
    console.log('[ACL] Finding product through Anti-Corruption Layer');
    const legacyItem = this.legacySystem.get_item_by_cd(productId);

    if (legacyItem.error_cd) {
      throw this.adapter.translateError(legacyItem);
    }

    return this.adapter.toDomainProduct(legacyItem);
  }

  async findAllActive() {
    console.log('[ACL] Finding all active products through Anti-Corruption Layer');
    const legacyItems = this.legacySystem.get_all_items();

    return legacyItems
      .map(item => this.adapter.toDomainProduct(item))
      .filter(product => product && product.isActive);
  }

  async updateQuantity(productId, quantity, operation) {
    console.log('[ACL] Updating quantity through Anti-Corruption Layer');
    const transactionType = this.adapter.toLegacyTransactionType(operation);
    const result = this.legacySystem.upd_item_qty(productId, quantity, transactionType);

    if (result.error_cd) {
      throw this.adapter.translateError(result);
    }

    // Return clean domain result
    return {
      productId: result.item_cd,
      newQuantity: result.new_qty_on_hnd
    };
  }
}

// ============================================================================
// DOMAIN SERVICE (Using Anti-Corruption Layer)
// ============================================================================

class PurchaseService {
  constructor() {
    this.productRepository = new ProductRepository();
    this.orders = [];
  }

  async purchaseProduct(productId, quantity) {
    console.log('[DOMAIN] Processing purchase through clean domain interface');

    // Work with clean domain objects
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    if (!product.canPurchase(quantity)) {
      throw new Error('Product cannot be purchased in requested quantity');
    }

    // Update inventory
    await this.productRepository.updateQuantity(productId, quantity, 'purchase');

    // Create domain order
    const order = new PurchaseOrder(product, quantity);
    this.orders.push(order);

    return order;
  }

  async getAvailableProducts() {
    console.log('[DOMAIN] Getting available products through clean domain interface');
    return this.productRepository.findAllActive();
  }

  getOrders() {
    return this.orders;
  }
}

// ============================================================================
// ADVANCED: Bi-directional Translation
// ============================================================================

class BidirectionalAdapter {
  constructor(legacySystem) {
    this.legacySystem = legacySystem;
    this.fieldMappings = {
      // Domain -> Legacy
      toLegacy: {
        id: 'item_cd',
        name: 'item_nm',
        price: 'unit_prc',
        quantityAvailable: 'qty_on_hnd',
        isActive: 'stat_cd'
      },
      // Legacy -> Domain
      toDomain: {
        item_cd: 'id',
        item_nm: 'name',
        unit_prc: 'price',
        qty_on_hnd: 'quantityAvailable',
        stat_cd: 'isActive'
      }
    };
  }

  transformValue(field, value, direction) {
    // Special transformations for certain fields
    if (field === 'stat_cd' && direction === 'toDomain') {
      return value === 'A';
    }
    if (field === 'isActive' && direction === 'toLegacy') {
      return value ? 'A' : 'D';
    }
    return value;
  }

  toDomainObject(legacyObject) {
    const domainObject = {};

    Object.keys(legacyObject).forEach(legacyKey => {
      const domainKey = this.fieldMappings.toDomain[legacyKey];
      if (domainKey) {
        domainObject[domainKey] = this.transformValue(
          legacyKey,
          legacyObject[legacyKey],
          'toDomain'
        );
      }
    });

    return domainObject;
  }

  toLegacyObject(domainObject) {
    const legacyObject = {};

    Object.keys(domainObject).forEach(domainKey => {
      const legacyKey = this.fieldMappings.toLegacy[domainKey];
      if (legacyKey) {
        legacyObject[legacyKey] = this.transformValue(
          domainKey,
          domainObject[domainKey],
          'toLegacy'
        );
      }
    });

    return legacyObject;
  }
}

// ============================================================================
// DEMONSTRATION
// ============================================================================

async function demonstrateAntiCorruptionLayer() {
  console.log('='.repeat(80));
  console.log('ANTI-CORRUPTION LAYER PATTERN DEMONSTRATION');
  console.log('='.repeat(80));

  console.log('\n--- ANTI-PATTERN: Direct Integration ---');
  const directService = new DirectIntegrationService();

  try {
    const item = directService.getProduct('ITM001');
    console.log('Retrieved item:', item);
    console.log('PROBLEM: Legacy field names (item_cd, qty_on_hnd) exposed to domain\n');

    const purchase = directService.purchaseProduct('ITM001', 5);
    console.log('Purchase result:', purchase);
    console.log('PROBLEM: Domain logic mixed with legacy system details\n');
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n--- SOLUTION: Using Anti-Corruption Layer ---');
  const purchaseService = new PurchaseService();

  try {
    // Clean domain interface
    const products = await purchaseService.getAvailableProducts();
    console.log('\nAvailable products (clean domain objects):');
    products.forEach(p => {
      console.log(`  - ${p.name}: $${p.price} (${p.quantityAvailable} available)`);
    });

    // Make purchase using domain concepts
    const order = await purchaseService.purchaseProduct('ITM001', 5);
    console.log('\nOrder created:');
    console.log(`  Order ID: ${order.orderId}`);
    console.log(`  Product: ${order.product.name}`);
    console.log(`  Quantity: ${order.quantity}`);
    console.log(`  Total: $${order.total.toFixed(2)}`);
    console.log('SUCCESS: Domain model remains clean!\n');

    // Verify quantity was updated
    const updatedProducts = await purchaseService.getAvailableProducts();
    const updatedProduct = updatedProducts.find(p => p.id === 'ITM001');
    console.log(`Updated quantity for ${updatedProduct.name}: ${updatedProduct.quantityAvailable}`);

  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n--- Bidirectional Translation ---');
  const adapter = new BidirectionalAdapter(new LegacyInventorySystem());

  const legacyData = { item_cd: 'ITM001', item_nm: 'Widget A', qty_on_hnd: 100, unit_prc: 10.50, stat_cd: 'A' };
  const domainData = adapter.toDomainObject(legacyData);
  console.log('Legacy data:', legacyData);
  console.log('Translated to domain:', domainData);

  const backToLegacy = adapter.toLegacyObject(domainData);
  console.log('Translated back to legacy:', backToLegacy);

  console.log('\n' + '='.repeat(80));
  console.log('KEY TAKEAWAYS:');
  console.log('='.repeat(80));
  console.log('1. Isolate legacy system concepts from your domain model');
  console.log('2. Create adapters/translators for bidirectional communication');
  console.log('3. Keep domain model clean and focused on business logic');
  console.log('4. Handle error translation at the boundary');
  console.log('5. Map legacy fields to meaningful domain names');
  console.log('6. Protect domain from external system changes');
  console.log('='.repeat(80));
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  // Anti-pattern
  DirectIntegrationService,
  LegacyInventorySystem,
  // Solution
  Product,
  PurchaseOrder,
  LegacySystemAdapter,
  ProductRepository,
  PurchaseService,
  BidirectionalAdapter,
  // Demo
  demonstrateAntiCorruptionLayer
};

// Run demonstration if executed directly
if (require.main === module) {
  demonstrateAntiCorruptionLayer().catch(console.error);
}
