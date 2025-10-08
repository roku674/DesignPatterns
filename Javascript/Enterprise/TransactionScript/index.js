const { MoneyTransferScript, OrderProcessingScript } = require('./TransactionScript');

// Mock database
class MockDatabase {
  constructor() {
    this.accounts = new Map([
      ['ACC001', { id: 'ACC001', balance: 1000 }],
      ['ACC002', { id: 'ACC002', balance: 500 }]
    ]);
    this.customers = new Map([
      ['CUST001', { id: 'CUST001', email: 'customer@example.com', loyaltyPoints: 150 }]
    ]);
    this.products = new Map([
      ['PROD001', { id: 'PROD001', name: 'Laptop', price: 999 }]
    ]);
  }

  async beginTransaction() {
    return {
      commit: async () => console.log('Transaction committed'),
      rollback: async () => console.log('Transaction rolled back')
    };
  }

  async getAccount(id) {
    return this.accounts.get(id);
  }

  async updateAccount(account) {
    this.accounts.set(account.id, account);
  }

  async logTransaction(log) {
    console.log('Transaction logged:', log);
  }

  async getCustomer(id) {
    return this.customers.get(id);
  }

  async getProduct(id) {
    return this.products.get(id);
  }

  async createOrder(order) {
    const orderId = 'ORD' + Date.now();
    console.log('Order created:', orderId);
    return orderId;
  }
}

// Mock services
const emailService = {
  sendOrderConfirmation: async (email, orderId) => {
    console.log(`Email sent to ${email} for order ${orderId}`);
  }
};

const inventoryService = {
  checkAvailability: async () => true,
  reserveItems: async (items, orderId) => {
    console.log(`Items reserved for order ${orderId}`);
  }
};

// Demonstrate Money Transfer
async function demonstrateMoneyTransfer() {
  console.log('=== Money Transfer Transaction Script ===\n');

  const db = new MockDatabase();
  const transferScript = new MoneyTransferScript(db);

  console.log('Before transfer:');
  console.log('Account ACC001:', db.accounts.get('ACC001'));
  console.log('Account ACC002:', db.accounts.get('ACC002'));

  const result = await transferScript.transferMoney('ACC001', 'ACC002', 200);

  console.log('\nAfter transfer:');
  console.log('Result:', result);
  console.log('Account ACC001:', db.accounts.get('ACC001'));
  console.log('Account ACC002:', db.accounts.get('ACC002'));
}

// Demonstrate Order Processing
async function demonstrateOrderProcessing() {
  console.log('\n\n=== Order Processing Transaction Script ===\n');

  const db = new MockDatabase();
  const orderScript = new OrderProcessingScript(db, emailService, inventoryService);

  const orderData = {
    customerId: 'CUST001',
    items: [
      { productId: 'PROD001', quantity: 1 }
    ]
  };

  const result = await orderScript.processOrder(orderData);
  console.log('\nOrder Result:', result);
}

// Run demonstrations
(async () => {
  await demonstrateMoneyTransfer();
  await demonstrateOrderProcessing();
})();
