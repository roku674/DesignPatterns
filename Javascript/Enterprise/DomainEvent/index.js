const { EventBus, UserCreatedEvent, OrderPlacedEvent } = require('./DomainEvent');

console.log('=== Domain Event Pattern Demo ===\n');

const eventBus = new EventBus();

eventBus.subscribe('UserCreated', (event) => {
  console.log(`[Email Service] Sending welcome email to ${event.data.email}`);
});

eventBus.subscribe('UserCreated', (event) => {
  console.log(`[Analytics] New user registered: ${event.data.username}`);
});

eventBus.subscribe('OrderPlaced', (event) => {
  console.log(`[Inventory] Processing order ${event.aggregateId} for $${event.data.total}`);
});

console.log('1. Creating user');
const userEvent = new UserCreatedEvent('user-1', 'johndoe', 'john@example.com');
eventBus.publish(userEvent);

console.log('\n2. Placing order');
const orderEvent = new OrderPlacedEvent('order-1', 'user-1', 99.99);
eventBus.publish(orderEvent);

console.log('\n=== Benefits ===');
console.log('✓ Decoupled components');
console.log('✓ Event-driven architecture');
console.log('✓ Auditing capability');
