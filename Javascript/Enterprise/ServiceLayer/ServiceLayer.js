/**
 * Service Layer Pattern
 *
 * Defines an application's boundary with a layer of services that establishes
 * a set of available operations and coordinates the application's response.
 */

const EventEmitter = require('events');

/**
 * Banking Service Layer
 */
class BankingService extends EventEmitter {
  constructor(accountRepository, transactionRepository, emailService) {
    super();
    this.accountRepository = accountRepository;
    this.transactionRepository = transactionRepository;
    this.emailService = emailService;
  }

  /**
   * Transfer money between accounts
   */
  async transferMoney(fromAccountId, toAccountId, amount) {
    // Start unit of work/transaction
    const transaction = await this.accountRepository.beginTransaction();

    try {
      // Load domain objects
      const fromAccount = await this.accountRepository.findById(fromAccountId, transaction);
      const toAccount = await this.accountRepository.findById(toAccountId, transaction);

      if (!fromAccount || !toAccount) {
        throw new Error('Account not found');
      }

      // Execute business logic
      fromAccount.withdraw(amount);
      toAccount.deposit(amount);

      // Persist changes
      await this.accountRepository.save(fromAccount, transaction);
      await this.accountRepository.save(toAccount, transaction);

      // Log transaction
      await this.transactionRepository.create({
        fromAccountId,
        toAccountId,
        amount,
        timestamp: new Date(),
        type: 'transfer'
      }, transaction);

      // Commit transaction
      await transaction.commit();

      // Send notification
      await this.emailService.sendTransferConfirmation(
        fromAccount.owner.email,
        toAccount.owner.email,
        amount
      );

      // Emit event
      this.emit('transfer-completed', {
        fromAccountId,
        toAccountId,
        amount
      });

      return {
        success: true,
        transactionId: Date.now(),
        fromBalance: fromAccount.balance,
        toBalance: toAccount.balance
      };
    } catch (error) {
      await transaction.rollback();
      this.emit('transfer-failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get account statement
   */
  async getAccountStatement(accountId, startDate, endDate) {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    const transactions = await this.transactionRepository.findByAccount(
      accountId,
      startDate,
      endDate
    );

    return {
      account: {
        id: account.id,
        owner: account.owner.name,
        balance: account.balance
      },
      transactions,
      period: { startDate, endDate }
    };
  }

  /**
   * Close account
   */
  async closeAccount(accountId) {
    const transaction = await this.accountRepository.beginTransaction();

    try {
      const account = await this.accountRepository.findById(accountId, transaction);

      if (!account) {
        throw new Error('Account not found');
      }

      if (account.balance !== 0) {
        throw new Error('Account must have zero balance to close');
      }

      account.status = 'closed';
      await this.accountRepository.save(account, transaction);
      await transaction.commit();

      await this.emailService.sendAccountClosedNotification(account.owner.email);

      this.emit('account-closed', { accountId });

      return { success: true };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

/**
 * Order Service Layer
 */
class OrderService extends EventEmitter {
  constructor(orderRepository, inventoryService, paymentService, shippingService) {
    super();
    this.orderRepository = orderRepository;
    this.inventoryService = inventoryService;
    this.paymentService = paymentService;
    this.shippingService = shippingService;
  }

  /**
   * Place order - coordinates multiple services
   */
  async placeOrder(customerId, items, paymentInfo, shippingAddress) {
    const transaction = await this.orderRepository.beginTransaction();

    try {
      // Check inventory
      const inventoryCheck = await this.inventoryService.checkAvailability(items);
      if (!inventoryCheck.available) {
        throw new Error(`Items not available: ${inventoryCheck.unavailableItems.join(', ')}`);
      }

      // Create order
      const order = {
        customerId,
        items,
        status: 'pending',
        createdAt: new Date()
      };

      const orderId = await this.orderRepository.create(order, transaction);

      // Reserve inventory
      await this.inventoryService.reserve(items, orderId);

      // Process payment
      const paymentResult = await this.paymentService.processPayment(
        paymentInfo,
        order.total
      );

      if (!paymentResult.success) {
        // Release inventory
        await this.inventoryService.release(orderId);
        throw new Error('Payment failed');
      }

      // Arrange shipping
      const shippingLabel = await this.shippingService.createLabel(
        orderId,
        shippingAddress
      );

      // Update order
      order.status = 'confirmed';
      order.paymentId = paymentResult.transactionId;
      order.shippingLabel = shippingLabel;

      await this.orderRepository.update(orderId, order, transaction);
      await transaction.commit();

      this.emit('order-placed', { orderId, customerId });

      return {
        success: true,
        orderId,
        paymentId: paymentResult.transactionId,
        estimatedDelivery: shippingLabel.estimatedDelivery
      };
    } catch (error) {
      await transaction.rollback();
      this.emit('order-failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId) {
    const transaction = await this.orderRepository.beginTransaction();

    try {
      const order = await this.orderRepository.findById(orderId, transaction);

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status === 'shipped') {
        throw new Error('Cannot cancel shipped order');
      }

      // Refund payment
      if (order.paymentId) {
        await this.paymentService.refund(order.paymentId);
      }

      // Release inventory
      await this.inventoryService.release(orderId);

      // Update order
      order.status = 'cancelled';
      await this.orderRepository.update(orderId, order, transaction);
      await transaction.commit();

      this.emit('order-cancelled', { orderId });

      return { success: true };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = {
  BankingService,
  OrderService
};
