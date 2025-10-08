const { BankingService, OrderService } = require('./ServiceLayer');

// Mock repositories and services
class MockAccountRepository {
  constructor() {
    this.accounts = new Map([
      ['ACC1', { id: 'ACC1', owner: { name: 'John', email: 'john@example.com' }, balance: 1000, withdraw(amt) { this.balance -= amt; }, deposit(amt) { this.balance += amt; } }],
      ['ACC2', { id: 'ACC2', owner: { name: 'Jane', email: 'jane@example.com' }, balance: 500, withdraw(amt) { this.balance -= amt; }, deposit(amt) { this.balance += amt; } }]
    ]);
  }

  async beginTransaction() {
    return {
      commit: async () => console.log('[Transaction] Committed'),
      rollback: async () => console.log('[Transaction] Rolled back')
    };
  }

  async findById(id) {
    return this.accounts.get(id);
  }

  async save(account) {
    this.accounts.set(account.id, account);
  }
}

const mockTransactionRepo = {
  create: async (txn) => console.log('[Transaction Log]', txn),
  findByAccount: async (id, start, end) => []
};

const mockEmailService = {
  sendTransferConfirmation: async (from, to, amount) =>
    console.log(`[Email] Transfer confirmation sent: ${from} -> ${to}, $${amount}`),
  sendAccountClosedNotification: async (email) =>
    console.log(`[Email] Account closed notification sent to ${email}`)
};

const mockInventoryService = {
  checkAvailability: async () => ({ available: true }),
  reserve: async (items, orderId) => console.log(`[Inventory] Reserved for order ${orderId}`),
  release: async (orderId) => console.log(`[Inventory] Released for order ${orderId}`)
};

const mockPaymentService = {
  processPayment: async (info, total) => ({ success: true, transactionId: 'PAY' + Date.now() }),
  refund: async (paymentId) => console.log(`[Payment] Refunded ${paymentId}`)
};

const mockShippingService = {
  createLabel: async (orderId, address) => ({
    trackingNumber: 'TRACK123',
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  })
};

const mockOrderRepo = {
  beginTransaction: async () => ({
    commit: async () => console.log('[Transaction] Committed'),
    rollback: async () => console.log('[Transaction] Rolled back')
  }),
  create: async (order) => {
    const id = 'ORD' + Date.now();
    console.log(`[Order] Created ${id}`);
    return id;
  },
  findById: async (id) => null,
  update: async (id, order) => console.log(`[Order] Updated ${id}`)
};

// Demo
(async () => {
  console.log('=== Service Layer Pattern Demo ===\n');

  // Banking Service
  console.log('--- Banking Service ---');
  const accountRepo = new MockAccountRepository();
  const bankingService = new BankingService(
    accountRepo,
    mockTransactionRepo,
    mockEmailService
  );

  bankingService.on('transfer-completed', (data) => {
    console.log('[Event] Transfer completed:', data);
  });

  console.log('Before transfer:');
  console.log('Account ACC1 balance:', accountRepo.accounts.get('ACC1').balance);
  console.log('Account ACC2 balance:', accountRepo.accounts.get('ACC2').balance);

  const result = await bankingService.transferMoney('ACC1', 'ACC2', 200);

  console.log('\nAfter transfer:');
  console.log('Result:', result);
  console.log('Account ACC1 balance:', accountRepo.accounts.get('ACC1').balance);
  console.log('Account ACC2 balance:', accountRepo.accounts.get('ACC2').balance);

  // Order Service
  console.log('\n--- Order Service ---');
  const orderService = new OrderService(
    mockOrderRepo,
    mockInventoryService,
    mockPaymentService,
    mockShippingService
  );

  orderService.on('order-placed', (data) => {
    console.log('[Event] Order placed:', data);
  });

  const orderResult = await orderService.placeOrder(
    'CUST123',
    [{ productId: 'P1', quantity: 2 }],
    { cardNumber: '****1234' },
    { street: '123 Main St', city: 'Anytown' }
  );

  console.log('\nOrder Result:', orderResult);
})();
