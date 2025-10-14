/**
 * Busy Front End Anti-Pattern
 *
 * PROBLEM:
 * The front-end/API layer performs too much work (data processing, business logic,
 * complex transformations) instead of delegating to background workers. This causes
 * slow response times, timeouts, and poor scalability.
 *
 * SYMPTOMS:
 * - Long request processing times
 * - API timeouts
 * - Poor scalability under load
 * - Blocked request threads
 * - CPU-intensive operations in request handlers
 *
 * SOLUTION:
 * Offload heavy processing to background workers using message queues,
 * return quickly to the client, and provide status endpoints for polling.
 */

// ============================================================================
// ANTI-PATTERN: Busy Front End
// ============================================================================

class BusyFrontEndAPI {
  constructor() {
    this.database = new Map();
    this.processingTime = 0;
  }

  // PROBLEM: Heavy processing in request handler
  async processOrder(orderId, items) {
    console.log(`[ANTI-PATTERN] Processing order ${orderId} synchronously in API`);
    const startTime = Date.now();

    // PROBLEM: Doing everything in the request handler
    // 1. Validate items (expensive)
    await this.validateItems(items);

    // 2. Calculate complex pricing (CPU intensive)
    const pricing = await this.calculateComplexPricing(items);

    // 3. Apply business rules (slow)
    const discounts = await this.applyBusinessRules(items, pricing);

    // 4. Generate invoice (document generation is slow)
    const invoice = await this.generateInvoice(orderId, items, pricing, discounts);

    // 5. Send notifications (external API calls)
    await this.sendNotifications(orderId, invoice);

    // 6. Update inventory (database operations)
    await this.updateInventory(items);

    // 7. Generate analytics (more processing)
    await this.generateAnalytics(orderId, items, pricing);

    const endTime = Date.now();
    this.processingTime = endTime - startTime;

    console.log(`[ANTI-PATTERN] Order ${orderId} processed in ${this.processingTime}ms`);
    console.log('PROBLEM: Client had to wait for ALL processing to complete!\n');

    return {
      orderId,
      status: 'completed',
      invoice,
      processingTime: this.processingTime
    };
  }

  // Simulated expensive operations
  async validateItems(items) {
    await this.sleep(200);
    return true;
  }

  async calculateComplexPricing(items) {
    await this.sleep(300);
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  async applyBusinessRules(items, pricing) {
    await this.sleep(250);
    return pricing * 0.1; // 10% discount
  }

  async generateInvoice(orderId, items, pricing, discounts) {
    await this.sleep(400);
    return {
      orderId,
      total: pricing - discounts,
      items: items.length,
      timestamp: new Date()
    };
  }

  async sendNotifications(orderId, invoice) {
    await this.sleep(500); // External API call
    console.log(`  Notifications sent for order ${orderId}`);
  }

  async updateInventory(items) {
    await this.sleep(300);
    console.log(`  Inventory updated for ${items.length} items`);
  }

  async generateAnalytics(orderId, items, pricing) {
    await this.sleep(200);
    console.log(`  Analytics generated for order ${orderId}`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// SOLUTION: Asynchronous Processing with Background Workers
// ============================================================================

class MessageQueue {
  constructor() {
    this.queues = new Map();
    this.workers = new Map();
  }

  createQueue(queueName) {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
    }
  }

  async enqueue(queueName, message) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} does not exist`);
    }

    queue.push({
      id: this.generateMessageId(),
      data: message,
      timestamp: Date.now(),
      status: 'queued'
    });

    // Trigger worker processing
    this.processQueue(queueName);
  }

  async processQueue(queueName) {
    const queue = this.queues.get(queueName);
    const worker = this.workers.get(queueName);

    if (!worker || queue.length === 0) {
      return;
    }

    const message = queue.shift();
    message.status = 'processing';

    try {
      await worker(message.data);
      message.status = 'completed';
    } catch (error) {
      message.status = 'failed';
      message.error = error.message;
    }

    // Process next message
    if (queue.length > 0) {
      setImmediate(() => this.processQueue(queueName));
    }
  }

  registerWorker(queueName, workerFunction) {
    this.workers.set(queueName, workerFunction);
  }

  generateMessageId() {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

class OrderStatus {
  constructor() {
    this.statuses = new Map();
  }

  create(orderId) {
    this.statuses.set(orderId, {
      orderId,
      status: 'pending',
      steps: {
        validation: 'pending',
        pricing: 'pending',
        invoice: 'pending',
        notifications: 'pending',
        inventory: 'pending',
        analytics: 'pending'
      },
      result: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  update(orderId, updates) {
    const status = this.statuses.get(orderId);
    if (!status) return;

    Object.assign(status, updates);
    status.updatedAt = Date.now();
  }

  updateStep(orderId, step, stepStatus) {
    const status = this.statuses.get(orderId);
    if (!status) return;

    status.steps[step] = stepStatus;
    status.updatedAt = Date.now();

    // Check if all steps are completed
    const allSteps = Object.values(status.steps);
    if (allSteps.every(s => s === 'completed')) {
      status.status = 'completed';
    } else if (allSteps.some(s => s === 'failed')) {
      status.status = 'failed';
    } else {
      status.status = 'processing';
    }
  }

  get(orderId) {
    return this.statuses.get(orderId);
  }
}

class BackgroundWorkerAPI {
  constructor() {
    this.messageQueue = new MessageQueue();
    this.orderStatus = new OrderStatus();
    this.database = new Map();

    // Initialize queues
    this.messageQueue.createQueue('order-processing');

    // Register worker
    this.messageQueue.registerWorker('order-processing', this.processOrderWorker.bind(this));
  }

  // Quick API response - just queue the work
  async submitOrder(orderId, items) {
    console.log(`[SOLUTION] Submitting order ${orderId} for async processing`);
    const startTime = Date.now();

    // Create status tracking
    this.orderStatus.create(orderId);

    // Queue the heavy work
    await this.messageQueue.enqueue('order-processing', {
      orderId,
      items,
      submittedAt: startTime
    });

    const responseTime = Date.now() - startTime;
    console.log(`[SOLUTION] Order ${orderId} queued in ${responseTime}ms`);
    console.log('SUCCESS: Client received immediate response!\n');

    return {
      orderId,
      status: 'accepted',
      message: 'Order is being processed',
      statusUrl: `/orders/${orderId}/status`,
      responseTime
    };
  }

  // Background worker does the heavy lifting
  async processOrderWorker(orderData) {
    const { orderId, items } = orderData;
    console.log(`[WORKER] Processing order ${orderId} in background`);

    try {
      // Step 1: Validate
      this.orderStatus.updateStep(orderId, 'validation', 'processing');
      await this.validateItems(items);
      this.orderStatus.updateStep(orderId, 'validation', 'completed');

      // Step 2: Calculate pricing
      this.orderStatus.updateStep(orderId, 'pricing', 'processing');
      const pricing = await this.calculateComplexPricing(items);
      const discounts = await this.applyBusinessRules(items, pricing);
      this.orderStatus.updateStep(orderId, 'pricing', 'completed');

      // Step 3: Generate invoice
      this.orderStatus.updateStep(orderId, 'invoice', 'processing');
      const invoice = await this.generateInvoice(orderId, items, pricing, discounts);
      this.orderStatus.updateStep(orderId, 'invoice', 'completed');

      // Step 4: Send notifications (can be async)
      this.orderStatus.updateStep(orderId, 'notifications', 'processing');
      await this.sendNotifications(orderId, invoice);
      this.orderStatus.updateStep(orderId, 'notifications', 'completed');

      // Step 5: Update inventory
      this.orderStatus.updateStep(orderId, 'inventory', 'processing');
      await this.updateInventory(items);
      this.orderStatus.updateStep(orderId, 'inventory', 'completed');

      // Step 6: Generate analytics
      this.orderStatus.updateStep(orderId, 'analytics', 'processing');
      await this.generateAnalytics(orderId, items, pricing);
      this.orderStatus.updateStep(orderId, 'analytics', 'completed');

      // Update final status
      this.orderStatus.update(orderId, {
        status: 'completed',
        result: { invoice, pricing, discounts }
      });

      console.log(`[WORKER] Order ${orderId} completed successfully`);
    } catch (error) {
      console.error(`[WORKER] Order ${orderId} failed:`, error.message);
      this.orderStatus.update(orderId, {
        status: 'failed',
        error: error.message
      });
    }
  }

  // Status endpoint for polling
  async getOrderStatus(orderId) {
    const status = this.orderStatus.get(orderId);
    if (!status) {
      throw new Error('Order not found');
    }
    return status;
  }

  // Simulated expensive operations (same as anti-pattern)
  async validateItems(items) {
    await this.sleep(200);
    return true;
  }

  async calculateComplexPricing(items) {
    await this.sleep(300);
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  async applyBusinessRules(items, pricing) {
    await this.sleep(250);
    return pricing * 0.1;
  }

  async generateInvoice(orderId, items, pricing, discounts) {
    await this.sleep(400);
    return {
      orderId,
      total: pricing - discounts,
      items: items.length,
      timestamp: new Date()
    };
  }

  async sendNotifications(orderId, invoice) {
    await this.sleep(500);
    console.log(`  [WORKER] Notifications sent for order ${orderId}`);
  }

  async updateInventory(items) {
    await this.sleep(300);
    console.log(`  [WORKER] Inventory updated for ${items.length} items`);
  }

  async generateAnalytics(orderId, items, pricing) {
    await this.sleep(200);
    console.log(`  [WORKER] Analytics generated for order ${orderId}`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// DEMONSTRATION
// ============================================================================

async function demonstrateBusyFrontEnd() {
  console.log('='.repeat(80));
  console.log('BUSY FRONT END ANTI-PATTERN DEMONSTRATION');
  console.log('='.repeat(80));

  const sampleOrder = {
    orderId: 'ORDER-001',
    items: [
      { id: 'item-1', name: 'Product A', price: 29.99, quantity: 2 },
      { id: 'item-2', name: 'Product B', price: 49.99, quantity: 1 },
      { id: 'item-3', name: 'Product C', price: 19.99, quantity: 3 }
    ]
  };

  console.log('\n--- ANTI-PATTERN: Busy Front End ---');
  const busyAPI = new BusyFrontEndAPI();

  const busyStartTime = Date.now();
  const busyResult = await busyAPI.processOrder(sampleOrder.orderId, sampleOrder.items);
  const busyTotalTime = Date.now() - busyStartTime;

  console.log('Result:', {
    orderId: busyResult.orderId,
    status: busyResult.status,
    processingTime: busyResult.processingTime
  });
  console.log(`Total API response time: ${busyTotalTime}ms`);
  console.log('PROBLEM: User waited 2+ seconds for response!\n');

  console.log('\n--- SOLUTION: Background Worker Pattern ---');
  const workerAPI = new BackgroundWorkerAPI();

  // Submit order - should return quickly
  const submitResult = await workerAPI.submitOrder('ORDER-002', sampleOrder.items);
  console.log('Immediate response:', {
    orderId: submitResult.orderId,
    status: submitResult.status,
    responseTime: submitResult.responseTime,
    statusUrl: submitResult.statusUrl
  });

  // Poll for status updates
  console.log('\nPolling for status updates...');
  let finalStatus;
  let pollCount = 0;

  while (pollCount < 10) {
    await new Promise(resolve => setTimeout(resolve, 300));
    finalStatus = await workerAPI.getOrderStatus('ORDER-002');
    pollCount++;

    console.log(`  Poll ${pollCount}: ${finalStatus.status} - ${Object.values(finalStatus.steps).filter(s => s === 'completed').length}/6 steps completed`);

    if (finalStatus.status === 'completed' || finalStatus.status === 'failed') {
      break;
    }
  }

  console.log('\nFinal status:', {
    orderId: finalStatus.orderId,
    status: finalStatus.status,
    steps: finalStatus.steps
  });

  console.log('\n' + '='.repeat(80));
  console.log('KEY TAKEAWAYS:');
  console.log('='.repeat(80));
  console.log('1. Return immediately to client, process asynchronously');
  console.log('2. Use message queues for background processing');
  console.log('3. Provide status endpoints for progress tracking');
  console.log('4. Improve user experience with faster initial response');
  console.log('5. Scale processing independently from API layer');
  console.log('6. Consider webhooks for completion notifications');
  console.log('='.repeat(80));
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  // Anti-pattern
  BusyFrontEndAPI,
  // Solution
  BackgroundWorkerAPI,
  MessageQueue,
  OrderStatus,
  // Demo
  demonstrateBusyFrontEnd
};

// Run demonstration if executed directly
if (require.main === module) {
  demonstrateBusyFrontEnd().catch(console.error);
}
