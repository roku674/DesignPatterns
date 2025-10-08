const { UnitOfWork, Customer, Order } = require('./UnitOfWork');

// Mock database
const mockDatabase = {
  beginTransaction: async () => ({
    commit: async () => console.log('[Database] Transaction committed'),
    rollback: async () => console.log('[Database] Transaction rolled back')
  })
};

// Demo
(async () => {
  console.log('=== Unit of Work Pattern Demo ===\n');

  const uow = new UnitOfWork();

  // Create new entities
  console.log('--- Creating new entities ---');
  const customer1 = new Customer(null, 'John Doe', 'john@example.com');
  const customer2 = new Customer(null, 'Jane Smith', 'jane@example.com');
  const order = new Order(null, null, 299.99);

  uow.registerNew(customer1);
  uow.registerNew(customer2);
  uow.registerNew(order);

  console.log('Registered 2 customers and 1 order as new');

  // Modify existing entity
  console.log('\n--- Modifying entities ---');
  const existingCustomer = new Customer(123, 'Bob Wilson', 'bob@example.com');
  uow.registerClean(existingCustomer, 123);

  existingCustomer.email = 'bob.wilson@example.com';
  uow.registerDirty(existingCustomer);
  console.log('Modified customer email');

  // Remove entity
  console.log('\n--- Removing entities ---');
  const customerToRemove = new Customer(456, 'Old Account', 'old@example.com');
  uow.registerClean(customerToRemove, 456);
  uow.registerRemoved(customerToRemove);
  console.log('Registered customer for removal');

  // Commit all changes
  console.log('\n--- Committing Unit of Work ---');
  await uow.commit(mockDatabase);

  console.log('\n✓ All changes committed in a single transaction');
  console.log(`  - ${3} inserts`);
  console.log(`  - ${1} update`);
  console.log(`  - ${1} delete`);

  // Demonstrate identity map
  console.log('\n--- Identity Map ---');
  const retrievedCustomer = uow.getFromIdentityMap(123);
  console.log('Retrieved from identity map:', retrievedCustomer);
})();
