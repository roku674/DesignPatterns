/**
 * Table Module Pattern
 *
 * A single instance that handles the business logic for all rows in a database table.
 */

/**
 * Account Table Module
 */
class AccountTableModule {
  constructor(database) {
    this.database = database;
  }

  /**
   * Get account balance
   */
  async getBalance(accountId) {
    const account = await this.database.query(
      'SELECT balance FROM accounts WHERE id = ?',
      [accountId]
    );
    return account[0].balance;
  }

  /**
   * Transfer money between accounts
   */
  async transfer(fromId, toId, amount) {
    const transaction = await this.database.beginTransaction();

    try {
      // Get balances
      const fromBalance = await this.getBalance(fromId);

      if (fromBalance < amount) {
        throw new Error('Insufficient funds');
      }

      // Update balances
      await this.database.execute(
        'UPDATE accounts SET balance = balance - ? WHERE id = ?',
        [amount, fromId],
        transaction
      );

      await this.database.execute(
        'UPDATE accounts SET balance = balance + ? WHERE id = ?',
        [amount, toId],
        transaction
      );

      await transaction.commit();
      return { success: true };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Calculate interest for all accounts
   */
  async applyInterest(rate) {
    await this.database.execute(
      'UPDATE accounts SET balance = balance * (1 + ?)',
      [rate]
    );
  }

  /**
   * Get accounts by owner
   */
  async getAccountsByOwner(ownerId) {
    return await this.database.query(
      'SELECT * FROM accounts WHERE owner_id = ?',
      [ownerId]
    );
  }
}

/**
 * Order Table Module
 */
class OrderTableModule {
  constructor(database) {
    this.database = database;
  }

  /**
   * Create new order
   */
  async createOrder(customerId, items) {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const result = await this.database.execute(
      'INSERT INTO orders (customer_id, total, status) VALUES (?, ?, ?)',
      [customerId, total, 'pending']
    );

    const orderId = result.insertId;

    // Insert order items
    for (const item of items) {
      await this.database.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price]
      );
    }

    return orderId;
  }

  /**
   * Get order total
   */
  async getOrderTotal(orderId) {
    const result = await this.database.query(
      'SELECT SUM(quantity * price) as total FROM order_items WHERE order_id = ?',
      [orderId]
    );
    return result[0].total;
  }

  /**
   * Update order status
   */
  async updateStatus(orderId, newStatus) {
    await this.database.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [newStatus, orderId]
    );
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status) {
    return await this.database.query(
      'SELECT * FROM orders WHERE status = ?',
      [status]
    );
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId) {
    const transaction = await this.database.beginTransaction();

    try {
      // Check current status
      const order = await this.database.query(
        'SELECT status FROM orders WHERE id = ?',
        [orderId],
        transaction
      );

      if (order[0].status === 'shipped') {
        throw new Error('Cannot cancel shipped order');
      }

      // Update status
      await this.database.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['cancelled', orderId],
        transaction
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = {
  AccountTableModule,
  OrderTableModule
};
