/**
 * Transaction Script Pattern
 *
 * Organizes business logic by procedures where each procedure handles a single
 * request from the presentation layer.
 */

/**
 * Transaction Script for transferring money between accounts
 */
class MoneyTransferScript {
  constructor(database) {
    this.database = database;
  }

  /**
   * Transfers money from one account to another
   * @param {string} fromAccountId - Source account ID
   * @param {string} toAccountId - Destination account ID
   * @param {number} amount - Amount to transfer
   * @returns {Promise<Object>} Transfer result
   */
  async transferMoney(fromAccountId, toAccountId, amount) {
    // Start transaction
    const transaction = await this.database.beginTransaction();

    try {
      // Get accounts
      const fromAccount = await this.database.getAccount(fromAccountId, transaction);
      const toAccount = await this.database.getAccount(toAccountId, transaction);

      // Validate
      if (!fromAccount || !toAccount) {
        throw new Error('Account not found');
      }

      if (fromAccount.balance < amount) {
        throw new Error('Insufficient funds');
      }

      if (amount <= 0) {
        throw new Error('Invalid amount');
      }

      // Perform transfer
      fromAccount.balance -= amount;
      toAccount.balance += amount;

      // Update database
      await this.database.updateAccount(fromAccount, transaction);
      await this.database.updateAccount(toAccount, transaction);

      // Log transaction
      await this.database.logTransaction({
        from: fromAccountId,
        to: toAccountId,
        amount,
        timestamp: new Date()
      }, transaction);

      // Commit
      await transaction.commit();

      return {
        success: true,
        newFromBalance: fromAccount.balance,
        newToBalance: toAccount.balance
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

/**
 * Transaction Script for order processing
 */
class OrderProcessingScript {
  constructor(database, emailService, inventoryService) {
    this.database = database;
    this.emailService = emailService;
    this.inventoryService = inventoryService;
  }

  /**
   * Processes a new order
   * @param {Object} orderData - Order information
   * @returns {Promise<Object>} Processing result
   */
  async processOrder(orderData) {
    const transaction = await this.database.beginTransaction();

    try {
      // Validate customer
      const customer = await this.database.getCustomer(orderData.customerId, transaction);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Check inventory
      const inventoryAvailable = await this.inventoryService.checkAvailability(
        orderData.items
      );

      if (!inventoryAvailable) {
        throw new Error('Items not available');
      }

      // Calculate totals
      let total = 0;
      for (const item of orderData.items) {
        const product = await this.database.getProduct(item.productId, transaction);
        total += product.price * item.quantity;
      }

      // Apply discounts
      if (customer.loyaltyPoints > 100) {
        total *= 0.9; // 10% discount
      }

      // Create order
      const order = {
        customerId: orderData.customerId,
        items: orderData.items,
        total,
        status: 'pending',
        createdAt: new Date()
      };

      const orderId = await this.database.createOrder(order, transaction);

      // Reserve inventory
      await this.inventoryService.reserveItems(orderData.items, orderId);

      // Send confirmation email
      await this.emailService.sendOrderConfirmation(customer.email, orderId);

      await transaction.commit();

      return {
        success: true,
        orderId,
        total
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = {
  MoneyTransferScript,
  OrderProcessingScript
};
