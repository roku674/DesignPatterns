const { AccountTableModule, OrderTableModule } = require('./TableModule');

// Mock database
class MockDatabase {
  constructor() {
    this.accounts = [
      { id: 1, owner_id: 1, balance: 1000 },
      { id: 2, owner_id: 1, balance: 500 },
      { id: 3, owner_id: 2, balance: 2000 }
    ];
    this.orders = [];
    this.orderItems = [];
  }

  async query(sql, params) {
    console.log(`Query: ${sql}`, params);

    if (sql.includes('SELECT balance')) {
      return this.accounts.filter(a => a.id === params[0]);
    }
    if (sql.includes('SELECT * FROM accounts WHERE owner_id')) {
      return this.accounts.filter(a => a.owner_id === params[0]);
    }
    if (sql.includes('SELECT * FROM orders WHERE status')) {
      return this.orders.filter(o => o.status === params[0]);
    }
    if (sql.includes('SELECT SUM')) {
      const items = this.orderItems.filter(i => i.order_id === params[0]);
      const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
      return [{ total }];
    }

    return [];
  }

  async execute(sql, params, transaction = null) {
    console.log(`Execute: ${sql}`, params);

    if (sql.includes('UPDATE accounts SET balance = balance -')) {
      const account = this.accounts.find(a => a.id === params[1]);
      if (account) account.balance -= params[0];
    }
    if (sql.includes('UPDATE accounts SET balance = balance +')) {
      const account = this.accounts.find(a => a.id === params[1]);
      if (account) account.balance += params[0];
    }
    if (sql.includes('INSERT INTO orders')) {
      const orderId = this.orders.length + 1;
      this.orders.push({
        id: orderId,
        customer_id: params[0],
        total: params[1],
        status: params[2]
      });
      return { insertId: orderId };
    }
    if (sql.includes('INSERT INTO order_items')) {
      this.orderItems.push({
        order_id: params[0],
        product_id: params[1],
        quantity: params[2],
        price: params[3]
      });
    }
    if (sql.includes('UPDATE orders SET status')) {
      const order = this.orders.find(o => o.id === params[1]);
      if (order) order.status = params[0];
    }
  }

  async beginTransaction() {
    return {
      commit: async () => console.log('Transaction committed'),
      rollback: async () => console.log('Transaction rolled back')
    };
  }
}

// Demo
(async () => {
  console.log('=== Table Module Pattern Demo ===\n');

  const db = new MockDatabase();

  // Account operations
  console.log('--- Account Table Module ---');
  const accountModule = new AccountTableModule(db);

  console.log('Initial balances:');
  console.log('Account 1:', await accountModule.getBalance(1));
  console.log('Account 2:', await accountModule.getBalance(2));

  await accountModule.transfer(1, 2, 200);

  console.log('\nAfter transfer:');
  console.log('Account 1:', await accountModule.getBalance(1));
  console.log('Account 2:', await accountModule.getBalance(2));

  // Order operations
  console.log('\n--- Order Table Module ---');
  const orderModule = new OrderTableModule(db);

  const orderId = await orderModule.createOrder(1, [
    { productId: 101, quantity: 2, price: 50 },
    { productId: 102, quantity: 1, price: 100 }
  ]);

  console.log('Created order:', orderId);
  console.log('Order total:', await orderModule.getOrderTotal(orderId));

  await orderModule.updateStatus(orderId, 'approved');
  console.log('Order status updated to approved');
})();
