/**
 * Domain Event Pattern
 */

class DomainEvent {
  constructor(aggregateId, eventType, data) {
    this.aggregateId = aggregateId;
    this.eventType = eventType;
    this.data = data;
    this.occurredOn = new Date();
    this.eventId = Math.random().toString(36).substr(2, 9);
  }
}

class EventBus {
  constructor() {
    this.handlers = new Map();
  }

  subscribe(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType).push(handler);
  }

  publish(event) {
    const handlers = this.handlers.get(event.eventType) || [];
    handlers.forEach(handler => handler(event));
  }
}

class UserCreatedEvent extends DomainEvent {
  constructor(userId, username, email) {
    super(userId, 'UserCreated', { username, email });
  }
}

class OrderPlacedEvent extends DomainEvent {
  constructor(orderId, customerId, total) {
    super(orderId, 'OrderPlaced', { customerId, total });
  }
}

module.exports = {
  DomainEvent,
  EventBus,
  UserCreatedEvent,
  OrderPlacedEvent
};
