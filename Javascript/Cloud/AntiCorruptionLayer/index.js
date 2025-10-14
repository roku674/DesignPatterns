/**
 * Anti-Corruption Layer Pattern - Comprehensive Usage Examples
 *
 * Demonstrates the Anti-Corruption Layer pattern for isolating domain models
 * from external systems, legacy code, and third-party integrations.
 */

const {
  Product,
  PurchaseOrder,
  LegacySystemAdapter,
  ProductRepository,
  PurchaseService,
  BidirectionalAdapter,
  LegacyInventorySystem,
  demonstrateAntiCorruptionLayer
} = require('./AntiCorruptionLayer');

/**
 * Scenario 1: Basic Anti-Corruption Layer
 * Demonstrates protecting domain model from legacy system
 */
async function scenario1_BasicACL() {
  console.log('\n=== Scenario 1: Basic Anti-Corruption Layer ===\n');

  const purchaseService = new PurchaseService();

  console.log('Fetching available products...');
  const products = await purchaseService.getAvailableProducts();

  console.log('\nAvailable Products:');
  products.forEach(product => {
    console.log(`  ${product.id}: ${product.name}`);
    console.log(`    Price: $${product.price.toFixed(2)}`);
    console.log(`    Available: ${product.quantityAvailable} units`);
    console.log(`    Active: ${product.isActive}`);
  });

  console.log('\nMaking a purchase...');
  const order = await purchaseService.purchaseProduct('ITM001', 3);

  console.log('\nOrder Details:');
  console.log(`  Order ID: ${order.orderId}`);
  console.log(`  Product: ${order.product.name}`);
  console.log(`  Quantity: ${order.quantity}`);
  console.log(`  Total: $${order.total.toFixed(2)}`);
  console.log(`  Timestamp: ${order.timestamp.toISOString()}`);

  console.log('\nVerifying updated inventory...');
  const updatedProducts = await purchaseService.getAvailableProducts();
  const updatedProduct = updatedProducts.find(p => p.id === 'ITM001');
  console.log(`Updated quantity: ${updatedProduct.quantityAvailable} units`);
}

/**
 * Scenario 2: Error Translation
 * Demonstrates translating legacy errors to domain exceptions
 */
async function scenario2_ErrorTranslation() {
  console.log('\n=== Scenario 2: Error Translation ===\n');

  const purchaseService = new PurchaseService();

  console.log('Attempting to purchase non-existent product...');
  try {
    await purchaseService.purchaseProduct('ITM999', 1);
  } catch (error) {
    console.log(`Caught domain error: ${error.name}`);
    console.log(`Message: ${error.message}`);
  }

  console.log('\nAttempting to purchase discontinued product...');
  try {
    await purchaseService.purchaseProduct('ITM003', 1);
  } catch (error) {
    console.log(`Caught domain error: ${error.name}`);
    console.log(`Message: ${error.message}`);
  }

  console.log('\nAttempting to purchase more than available...');
  try {
    await purchaseService.purchaseProduct('ITM002', 100);
  } catch (error) {
    console.log(`Caught error: ${error.message}`);
  }
}

/**
 * Scenario 3: Bidirectional Translation
 * Demonstrates two-way data transformation
 */
async function scenario3_BidirectionalTranslation() {
  console.log('\n=== Scenario 3: Bidirectional Translation ===\n');

  const legacySystem = new LegacyInventorySystem();
  const adapter = new BidirectionalAdapter(legacySystem);

  console.log('Legacy Data Structure:');
  const legacyData = {
    item_cd: 'ITM001',
    item_nm: 'Widget A',
    qty_on_hnd: 100,
    unit_prc: 10.50,
    stat_cd: 'A'
  };
  console.log(JSON.stringify(legacyData, null, 2));

  console.log('\nTranslated to Domain Model:');
  const domainData = adapter.toDomainObject(legacyData);
  console.log(JSON.stringify(domainData, null, 2));

  console.log('\nTranslated Back to Legacy Format:');
  const backToLegacy = adapter.toLegacyObject(domainData);
  console.log(JSON.stringify(backToLegacy, null, 2));

  console.log('\nVerifying round-trip translation:');
  const matches = JSON.stringify(legacyData) === JSON.stringify(backToLegacy);
  console.log(`Data integrity preserved: ${matches}`);
}

/**
 * Scenario 4: Multiple Legacy Systems
 * Demonstrates ACL with multiple external systems
 */
async function scenario4_MultipleLegacySystems() {
  console.log('\n=== Scenario 4: Multiple Legacy Systems ===\n');

  // Simulate multiple legacy systems
  class LegacyCustomerSystem {
    getCustomer(custId) {
      return {
        cust_id: custId,
        f_name: 'John',
        l_name: 'Doe',
        email_addr: 'john@example.com',
        cust_type: 'PREM'
      };
    }
  }

  class LegacyOrderSystem {
    createOrder(custId, items) {
      return {
        ord_num: `ORD${Date.now()}`,
        cust_id: custId,
        ord_items: items,
        ord_status: 'PEND',
        create_ts: Date.now()
      };
    }
  }

  // Domain models
  class Customer {
    constructor(id, firstName, lastName, email, isPremium) {
      this.id = id;
      this.firstName = firstName;
      this.lastName = lastName;
      this.email = email;
      this.isPremium = isPremium;
    }

    getFullName() {
      return `${this.firstName} ${this.lastName}`;
    }
  }

  class Order {
    constructor(orderNumber, customer, items, status, createdAt) {
      this.orderNumber = orderNumber;
      this.customer = customer;
      this.items = items;
      this.status = status;
      this.createdAt = createdAt;
    }
  }

  // Adapters
  class CustomerAdapter {
    constructor(legacySystem) {
      this.legacySystem = legacySystem;
    }

    toDomainCustomer(legacyCustomer) {
      return new Customer(
        legacyCustomer.cust_id,
        legacyCustomer.f_name,
        legacyCustomer.l_name,
        legacyCustomer.email_addr,
        legacyCustomer.cust_type === 'PREM'
      );
    }
  }

  class OrderAdapter {
    constructor(legacySystem) {
      this.legacySystem = legacySystem;
    }

    toDomainOrder(legacyOrder, customer) {
      const statusMap = {
        'PEND': 'pending',
        'PROC': 'processing',
        'SHIP': 'shipped',
        'COMP': 'completed'
      };

      return new Order(
        legacyOrder.ord_num,
        customer,
        legacyOrder.ord_items,
        statusMap[legacyOrder.ord_status] || 'unknown',
        new Date(legacyOrder.create_ts)
      );
    }

    toLegacyOrder(customer, items) {
      return this.legacySystem.createOrder(customer.id, items);
    }
  }

  // Use the adapters
  const customerSystem = new LegacyCustomerSystem();
  const orderSystem = new LegacyOrderSystem();
  const customerAdapter = new CustomerAdapter(customerSystem);
  const orderAdapter = new OrderAdapter(orderSystem);

  console.log('Fetching customer from legacy system...');
  const legacyCustomer = customerSystem.getCustomer('CUST001');
  const customer = customerAdapter.toDomainCustomer(legacyCustomer);

  console.log('\nDomain Customer:');
  console.log(`  Name: ${customer.getFullName()}`);
  console.log(`  Email: ${customer.email}`);
  console.log(`  Premium: ${customer.isPremium}`);

  console.log('\nCreating order through legacy system...');
  const legacyOrder = orderAdapter.toLegacyOrder(customer, ['ITM001', 'ITM002']);
  const order = orderAdapter.toDomainOrder(legacyOrder, customer);

  console.log('\nDomain Order:');
  console.log(`  Order Number: ${order.orderNumber}`);
  console.log(`  Customer: ${order.customer.getFullName()}`);
  console.log(`  Items: ${order.items.join(', ')}`);
  console.log(`  Status: ${order.status}`);
  console.log(`  Created: ${order.createdAt.toISOString()}`);
}

/**
 * Scenario 5: Microservices Integration
 * Demonstrates ACL for microservices boundaries
 */
async function scenario5_MicroservicesIntegration() {
  console.log('\n=== Scenario 5: Microservices Integration ===\n');

  // External Payment Service with different structure
  class ExternalPaymentService {
    processPayment(paymentData) {
      return {
        transaction_id: `TXN${Date.now()}`,
        payment_status: 'SUCCESS',
        payment_method: paymentData.method,
        amount_cents: paymentData.amount * 100,
        currency_code: 'USD',
        timestamp_utc: Date.now(),
        processor_reference: `REF${Math.random().toString(36).substr(2, 9)}`
      };
    }
  }

  // Domain Payment Model
  class Payment {
    constructor(id, amount, currency, status, method, processedAt, reference) {
      this.id = id;
      this.amount = amount;
      this.currency = currency;
      this.status = status;
      this.method = method;
      this.processedAt = processedAt;
      this.reference = reference;
    }

    isSuccessful() {
      return this.status === 'completed';
    }

    getFormattedAmount() {
      return `${this.currency} ${this.amount.toFixed(2)}`;
    }
  }

  // Payment ACL
  class PaymentServiceAdapter {
    constructor(externalService) {
      this.externalService = externalService;
    }

    async processPayment(amount, method) {
      const paymentData = {
        amount: amount,
        method: method
      };

      const externalResult = this.externalService.processPayment(paymentData);
      return this.toDomainPayment(externalResult);
    }

    toDomainPayment(externalPayment) {
      const statusMap = {
        'SUCCESS': 'completed',
        'PENDING': 'processing',
        'FAILED': 'failed',
        'CANCELLED': 'cancelled'
      };

      return new Payment(
        externalPayment.transaction_id,
        externalPayment.amount_cents / 100,
        externalPayment.currency_code,
        statusMap[externalPayment.payment_status] || 'unknown',
        externalPayment.payment_method,
        new Date(externalPayment.timestamp_utc),
        externalPayment.processor_reference
      );
    }
  }

  console.log('Processing payment through external service...');
  const paymentService = new ExternalPaymentService();
  const paymentAdapter = new PaymentServiceAdapter(paymentService);

  const payment = await paymentAdapter.processPayment(99.99, 'credit_card');

  console.log('\nDomain Payment:');
  console.log(`  ID: ${payment.id}`);
  console.log(`  Amount: ${payment.getFormattedAmount()}`);
  console.log(`  Method: ${payment.method}`);
  console.log(`  Status: ${payment.status}`);
  console.log(`  Successful: ${payment.isSuccessful()}`);
  console.log(`  Processed: ${payment.processedAt.toISOString()}`);
  console.log(`  Reference: ${payment.reference}`);
}

/**
 * Scenario 6: API Version Translation
 * Demonstrates ACL for managing API version differences
 */
async function scenario6_APIVersionTranslation() {
  console.log('\n=== Scenario 6: API Version Translation ===\n');

  // API V1 (Legacy)
  class APIv1 {
    getUser(id) {
      return {
        user_id: id,
        username: 'johndoe',
        email: 'john@example.com',
        created: '2020-01-01'
      };
    }
  }

  // API V2 (Current)
  class APIv2 {
    getUser(id) {
      return {
        id: id,
        profile: {
          username: 'johndoe',
          email: 'john@example.com',
          displayName: 'John Doe'
        },
        metadata: {
          createdAt: '2020-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          version: 2
        }
      };
    }
  }

  // Domain User
  class User {
    constructor(id, username, email, displayName, createdAt) {
      this.id = id;
      this.username = username;
      this.email = email;
      this.displayName = displayName;
      this.createdAt = createdAt;
    }
  }

  // Version-aware adapter
  class UserAPIAdapter {
    constructor(apiVersion, apiClient) {
      this.apiVersion = apiVersion;
      this.apiClient = apiClient;
    }

    async getUser(id) {
      const apiResponse = this.apiClient.getUser(id);

      if (this.apiVersion === 1) {
        return this.fromV1(apiResponse);
      } else if (this.apiVersion === 2) {
        return this.fromV2(apiResponse);
      }

      throw new Error(`Unsupported API version: ${this.apiVersion}`);
    }

    fromV1(v1Response) {
      return new User(
        v1Response.user_id,
        v1Response.username,
        v1Response.email,
        v1Response.username, // V1 doesn't have display name
        new Date(v1Response.created)
      );
    }

    fromV2(v2Response) {
      return new User(
        v2Response.id,
        v2Response.profile.username,
        v2Response.profile.email,
        v2Response.profile.displayName,
        new Date(v2Response.metadata.createdAt)
      );
    }
  }

  console.log('Fetching user from API v1...');
  const apiv1 = new APIv1();
  const adapterV1 = new UserAPIAdapter(1, apiv1);
  const userV1 = await adapterV1.getUser('123');

  console.log('\nUser from API v1:');
  console.log(`  ID: ${userV1.id}`);
  console.log(`  Username: ${userV1.username}`);
  console.log(`  Email: ${userV1.email}`);
  console.log(`  Display Name: ${userV1.displayName}`);
  console.log(`  Created: ${userV1.createdAt.toISOString()}`);

  console.log('\nFetching user from API v2...');
  const apiv2 = new APIv2();
  const adapterV2 = new UserAPIAdapter(2, apiv2);
  const userV2 = await adapterV2.getUser('123');

  console.log('\nUser from API v2:');
  console.log(`  ID: ${userV2.id}`);
  console.log(`  Username: ${userV2.username}`);
  console.log(`  Email: ${userV2.email}`);
  console.log(`  Display Name: ${userV2.displayName}`);
  console.log(`  Created: ${userV2.createdAt.toISOString()}`);

  console.log('\nBoth versions produce same domain model structure!');
}

/**
 * Scenario 7: Database Schema Translation
 * Demonstrates ACL for database access
 */
async function scenario7_DatabaseSchemaTranslation() {
  console.log('\n=== Scenario 7: Database Schema Translation ===\n');

  // Legacy database with denormalized schema
  class LegacyDatabase {
    queryUser(id) {
      return {
        user_id: id,
        user_name: 'johndoe',
        user_email: 'john@example.com',
        addr_street: '123 Main St',
        addr_city: 'Springfield',
        addr_state: 'IL',
        addr_zip: '62701',
        pref_theme: 'dark',
        pref_lang: 'en',
        pref_notify: '1'
      };
    }
  }

  // Domain models (normalized)
  class Address {
    constructor(street, city, state, zipCode) {
      this.street = street;
      this.city = city;
      this.state = state;
      this.zipCode = zipCode;
    }

    getFullAddress() {
      return `${this.street}, ${this.city}, ${this.state} ${this.zipCode}`;
    }
  }

  class Preferences {
    constructor(theme, language, notificationsEnabled) {
      this.theme = theme;
      this.language = language;
      this.notificationsEnabled = notificationsEnabled;
    }
  }

  class DomainUser {
    constructor(id, username, email, address, preferences) {
      this.id = id;
      this.username = username;
      this.email = email;
      this.address = address;
      this.preferences = preferences;
    }
  }

  // Database adapter
  class DatabaseAdapter {
    constructor(database) {
      this.database = database;
    }

    async getUserById(id) {
      const dbRow = this.database.queryUser(id);
      return this.toDomainUser(dbRow);
    }

    toDomainUser(dbRow) {
      const address = new Address(
        dbRow.addr_street,
        dbRow.addr_city,
        dbRow.addr_state,
        dbRow.addr_zip
      );

      const preferences = new Preferences(
        dbRow.pref_theme,
        dbRow.pref_lang,
        dbRow.pref_notify === '1'
      );

      return new DomainUser(
        dbRow.user_id,
        dbRow.user_name,
        dbRow.user_email,
        address,
        preferences
      );
    }

    toDbRow(domainUser) {
      return {
        user_id: domainUser.id,
        user_name: domainUser.username,
        user_email: domainUser.email,
        addr_street: domainUser.address.street,
        addr_city: domainUser.address.city,
        addr_state: domainUser.address.state,
        addr_zip: domainUser.address.zipCode,
        pref_theme: domainUser.preferences.theme,
        pref_lang: domainUser.preferences.language,
        pref_notify: domainUser.preferences.notificationsEnabled ? '1' : '0'
      };
    }
  }

  console.log('Querying legacy database...');
  const database = new LegacyDatabase();
  const dbAdapter = new DatabaseAdapter(database);

  const user = await dbAdapter.getUserById('123');

  console.log('\nDomain User (from denormalized database):');
  console.log(`  ID: ${user.id}`);
  console.log(`  Username: ${user.username}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Address: ${user.address.getFullAddress()}`);
  console.log(`  Preferences:`);
  console.log(`    Theme: ${user.preferences.theme}`);
  console.log(`    Language: ${user.preferences.language}`);
  console.log(`    Notifications: ${user.preferences.notificationsEnabled}`);
}

/**
 * Scenario 8: Third-Party Service Integration
 * Demonstrates ACL for external service APIs
 */
async function scenario8_ThirdPartyIntegration() {
  console.log('\n=== Scenario 8: Third-Party Service Integration ===\n');

  // Third-party shipping service
  class ThirdPartyShippingAPI {
    calculateShipping(data) {
      return {
        carrier: 'FEDEX',
        service_level: 'GROUND',
        rate_cents: 1250,
        currency: 'USD',
        est_delivery_days: 5,
        tracking_available: true,
        insurance_cents: 200
      };
    }

    createShipment(data) {
      return {
        shipment_id: `SHIP${Date.now()}`,
        tracking_num: `TRK${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
        label_url: 'https://api.shipping.com/labels/abc123.pdf',
        status_code: 'CREATED'
      };
    }
  }

  // Domain shipping models
  class ShippingRate {
    constructor(carrier, service, cost, currency, estimatedDays, trackingAvailable, insuranceCost) {
      this.carrier = carrier;
      this.service = service;
      this.cost = cost;
      this.currency = currency;
      this.estimatedDays = estimatedDays;
      this.trackingAvailable = trackingAvailable;
      this.insuranceCost = insuranceCost;
    }

    getTotalCost() {
      return this.cost + this.insuranceCost;
    }

    getFormattedCost() {
      return `${this.currency} ${this.getTotalCost().toFixed(2)}`;
    }
  }

  class Shipment {
    constructor(id, trackingNumber, labelUrl, status) {
      this.id = id;
      this.trackingNumber = trackingNumber;
      this.labelUrl = labelUrl;
      this.status = status;
      this.createdAt = new Date();
    }
  }

  // Shipping service adapter
  class ShippingServiceAdapter {
    constructor(shippingAPI) {
      this.shippingAPI = shippingAPI;
    }

    async getRates(shipmentDetails) {
      const apiResponse = this.shippingAPI.calculateShipping(shipmentDetails);
      return this.toShippingRate(apiResponse);
    }

    async createShipment(shipmentDetails) {
      const apiResponse = this.shippingAPI.createShipment(shipmentDetails);
      return this.toShipment(apiResponse);
    }

    toShippingRate(apiResponse) {
      const serviceMap = {
        'GROUND': 'ground',
        'EXPRESS': 'express',
        'OVERNIGHT': 'overnight'
      };

      return new ShippingRate(
        apiResponse.carrier,
        serviceMap[apiResponse.service_level] || 'standard',
        apiResponse.rate_cents / 100,
        apiResponse.currency,
        apiResponse.est_delivery_days,
        apiResponse.tracking_available,
        apiResponse.insurance_cents / 100
      );
    }

    toShipment(apiResponse) {
      const statusMap = {
        'CREATED': 'created',
        'IN_TRANSIT': 'in_transit',
        'DELIVERED': 'delivered',
        'EXCEPTION': 'exception'
      };

      return new Shipment(
        apiResponse.shipment_id,
        apiResponse.tracking_num,
        apiResponse.label_url,
        statusMap[apiResponse.status_code] || 'unknown'
      );
    }
  }

  console.log('Calculating shipping rates...');
  const shippingAPI = new ThirdPartyShippingAPI();
  const shippingAdapter = new ShippingServiceAdapter(shippingAPI);

  const rate = await shippingAdapter.getRates({
    weight: 5,
    dimensions: { length: 10, width: 8, height: 6 }
  });

  console.log('\nShipping Rate:');
  console.log(`  Carrier: ${rate.carrier}`);
  console.log(`  Service: ${rate.service}`);
  console.log(`  Base Cost: ${rate.currency} ${rate.cost.toFixed(2)}`);
  console.log(`  Insurance: ${rate.currency} ${rate.insuranceCost.toFixed(2)}`);
  console.log(`  Total: ${rate.getFormattedCost()}`);
  console.log(`  Estimated Delivery: ${rate.estimatedDays} days`);
  console.log(`  Tracking Available: ${rate.trackingAvailable}`);

  console.log('\nCreating shipment...');
  const shipment = await shippingAdapter.createShipment({
    weight: 5,
    destination: '123 Main St'
  });

  console.log('\nShipment Created:');
  console.log(`  ID: ${shipment.id}`);
  console.log(`  Tracking Number: ${shipment.trackingNumber}`);
  console.log(`  Label URL: ${shipment.labelUrl}`);
  console.log(`  Status: ${shipment.status}`);
  console.log(`  Created At: ${shipment.createdAt.toISOString()}`);
}

/**
 * Run all scenarios
 */
async function runAllScenarios() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   Anti-Corruption Layer - Comprehensive Usage Examples        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  try {
    await scenario1_BasicACL();
    await scenario2_ErrorTranslation();
    await scenario3_BidirectionalTranslation();
    await scenario4_MultipleLegacySystems();
    await scenario5_MicroservicesIntegration();
    await scenario6_APIVersionTranslation();
    await scenario7_DatabaseSchemaTranslation();
    await scenario8_ThirdPartyIntegration();

    console.log('\n\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║     All Anti-Corruption Layer Scenarios Complete!             ║');
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
  scenario1_BasicACL,
  scenario2_ErrorTranslation,
  scenario3_BidirectionalTranslation,
  scenario4_MultipleLegacySystems,
  scenario5_MicroservicesIntegration,
  scenario6_APIVersionTranslation,
  scenario7_DatabaseSchemaTranslation,
  scenario8_ThirdPartyIntegration,
  runAllScenarios
};
