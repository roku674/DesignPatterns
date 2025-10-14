/**
 * Choreography Pattern
 *
 * Distributed workflow where each service knows what to do after receiving an event,
 * without central coordination. Services produce and consume events autonomously.
 *
 * Benefits:
 * - Loose coupling: Services don't need to know about each other
 * - Scalability: Easy to add new services
 * - Resilience: No single point of failure
 * - Flexibility: Services can evolve independently
 *
 * Use Cases:
 * - Event-driven microservices
 * - Order processing workflows
 * - Saga pattern implementation
 * - Reactive systems
 */

class EventBus {
  constructor() {
    this.subscriptions = new Map();
    this.eventHistory = [];
    this.statistics = {
      eventsPublished: 0,
      eventsDelivered: 0,
      subscriptions: 0
    };
  }

  subscribe(eventType, handler, serviceId) {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    this.subscriptions.get(eventType).push({ handler, serviceId });
    this.statistics.subscriptions++;
    console.log(`[EventBus] ${serviceId} subscribed to ${eventType}`);
  }

  async publish(event) {
    const enrichedEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      publishedAt: Date.now()
    };

    this.eventHistory.push(enrichedEvent);
    this.statistics.eventsPublished++;

    console.log(`[EventBus] Published: ${enrichedEvent.type} (id: ${enrichedEvent.id})`);

    const handlers = this.subscriptions.get(enrichedEvent.type) || [];

    for (const { handler, serviceId } of handlers) {
      (async () => {
        await handler(enrichedEvent);
        this.statistics.eventsDelivered++;
      })().catch(error => {
        console.error(`[EventBus] Error delivering to ${serviceId}:`, error.message);
      });
    }

    return enrichedEvent.id;
  }

  getStatistics() {
    return {
      ...this.statistics,
      eventHistorySize: this.eventHistory.length
    };
  }
}

class ChoreographyService {
  constructor(id, eventBus) {
    this.id = id;
    this.eventBus = eventBus;
    this.state = new Map();
    this.statistics = {
      eventsReceived: 0,
      eventsPublished: 0,
      actionsPerformed: 0
    };
  }

  subscribe(eventType, handler) {
    this.eventBus.subscribe(eventType, async (event) => {
      this.statistics.eventsReceived++;
      console.log(`  [${this.id}] Received: ${event.type}`);
      await handler.call(this, event);
    }, this.id);
  }

  async publishEvent(eventType, data) {
    this.statistics.eventsPublished++;
    return await this.eventBus.publish({
      type: eventType,
      source: this.id,
      data: data
    });
  }

  saveState(key, value) {
    this.state.set(key, value);
  }

  getState(key) {
    return this.state.get(key);
  }

  getStatistics() {
    return { ...this.statistics };
  }
}

class Choreography {
  constructor(config = {}) {
    this.config = {
      enableLogging: config.enableLogging !== false,
      ...config
    };

    this.eventBus = new EventBus();
    this.services = new Map();
  }

  createService(serviceId, setupFunction) {
    const service = new ChoreographyService(serviceId, this.eventBus);
    setupFunction(service);
    this.services.set(serviceId, service);
    console.log(`[Choreography] Created service: ${serviceId}`);
    return service;
  }

  async initiateWorkflow(initialEvent) {
    console.log(`\n[Choreography] Initiating workflow: ${initialEvent.type}\n`);
    await this.eventBus.publish(initialEvent);

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  getStatistics() {
    const serviceStats = {};
    for (const [id, service] of this.services) {
      serviceStats[id] = service.getStatistics();
    }

    return {
      eventBus: this.eventBus.getStatistics(),
      services: serviceStats,
      totalServices: this.services.size
    };
  }

  printStatistics() {
    const stats = this.getStatistics();

    console.log('\n========== Choreography Pattern Statistics ==========');
    console.log(`Total Services: ${stats.totalServices}\n`);

    console.log('Event Bus:');
    console.log(`  Events Published: ${stats.eventBus.eventsPublished}`);
    console.log(`  Events Delivered: ${stats.eventBus.eventsDelivered}`);
    console.log(`  Subscriptions: ${stats.eventBus.subscriptions}`);

    console.log('\nServices:');
    for (const [serviceId, serviceStats] of Object.entries(stats.services)) {
      console.log(`  ${serviceId}:`);
      console.log(`    Events Received: ${serviceStats.eventsReceived}`);
      console.log(`    Events Published: ${serviceStats.eventsPublished}`);
      console.log(`    Actions Performed: ${serviceStats.actionsPerformed}`);
    }

    console.log('=====================================================\n');
  }

  execute() {
    console.log('Choreography Pattern Demonstration');
    console.log('==================================\n');
    console.log('Configuration:');
    console.log(`  Logging: ${this.config.enableLogging}`);
    console.log('');

    return {
      success: true,
      pattern: 'Choreography',
      config: this.config,
      components: {
        services: this.services.size
      }
    };
  }
}

async function demonstrateChoreography() {
  console.log('Starting Choreography Pattern Demonstration\n');

  const workflow = new Choreography({ enableLogging: true });

  console.log('--- Creating Services ---\n');

  workflow.createService('order-service', (service) => {
    service.subscribe('order-placed', async function(event) {
      console.log(`    [${this.id}] Processing order ${event.data.orderId}`);
      this.saveState(event.data.orderId, { status: 'processing' });
      this.statistics.actionsPerformed++;

      await new Promise(resolve => setTimeout(resolve, 50));
      await this.publishEvent('order-validated', {
        orderId: event.data.orderId,
        items: event.data.items
      });
    });
  });

  workflow.createService('inventory-service', (service) => {
    service.subscribe('order-validated', async function(event) {
      console.log(`    [${this.id}] Reserving inventory for order ${event.data.orderId}`);
      this.statistics.actionsPerformed++;

      await new Promise(resolve => setTimeout(resolve, 40));
      await this.publishEvent('inventory-reserved', {
        orderId: event.data.orderId,
        items: event.data.items
      });
    });
  });

  workflow.createService('payment-service', (service) => {
    service.subscribe('inventory-reserved', async function(event) {
      console.log(`    [${this.id}] Processing payment for order ${event.data.orderId}`);
      this.statistics.actionsPerformed++;

      await new Promise(resolve => setTimeout(resolve, 60));
      await this.publishEvent('payment-completed', {
        orderId: event.data.orderId,
        amount: 99.99
      });
    });
  });

  workflow.createService('shipping-service', (service) => {
    service.subscribe('payment-completed', async function(event) {
      console.log(`    [${this.id}] Creating shipment for order ${event.data.orderId}`);
      this.statistics.actionsPerformed++;

      await new Promise(resolve => setTimeout(resolve, 30));
      await this.publishEvent('shipment-created', {
        orderId: event.data.orderId,
        trackingNumber: 'TRACK-123'
      });
    });
  });

  workflow.createService('notification-service', (service) => {
    service.subscribe('order-validated', async function(event) {
      console.log(`    [${this.id}] Sending order confirmation`);
      this.statistics.actionsPerformed++;
    });

    service.subscribe('shipment-created', async function(event) {
      console.log(`    [${this.id}] Sending shipment notification`);
      this.statistics.actionsPerformed++;
    });
  });

  workflow.execute();

  await workflow.initiateWorkflow({
    type: 'order-placed',
    source: 'customer',
    data: {
      orderId: 'ORD-12345',
      customerId: 'CUST-789',
      items: ['item1', 'item2'],
      total: 99.99
    }
  });

  workflow.printStatistics();
}

if (require.main === module) {
  demonstrateChoreography().catch(console.error);
}

module.exports = Choreography;
