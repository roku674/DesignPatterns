#!/bin/bash

# DomainEvent
mkdir -p DomainEvent
cat > DomainEvent/DomainEvent.js << 'EOF'
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
EOF

cat > DomainEvent/index.js << 'EOF'
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
EOF

cat > DomainEvent/README.md << 'EOF'
# Domain Event Pattern

## Intent
Capture domain events as objects for notification and auditing.

## Use When
- Domain changes need to trigger side effects
- Event sourcing is required
- Audit trail is needed

## Run
`node index.js`
EOF

# EventSourcing
mkdir -p EventSourcing
cat > EventSourcing/EventSourcing.js << 'EOF'
/**
 * Event Sourcing Pattern
 */

class Event {
  constructor(type, data) {
    this.type = type;
    this.data = data;
    this.timestamp = Date.now();
  }
}

class EventStore {
  constructor() {
    this.events = [];
  }

  append(event) {
    this.events.push(event);
  }

  getEvents(aggregateId) {
    return this.events.filter(e => e.data.id === aggregateId);
  }

  getAllEvents() {
    return [...this.events];
  }
}

class BankAccount {
  constructor(id) {
    this.id = id;
    this.balance = 0;
    this.version = 0;
  }

  apply(event) {
    switch(event.type) {
      case 'AccountCreated':
        this.balance = event.data.initialBalance;
        break;
      case 'MoneyDeposited':
        this.balance += event.data.amount;
        break;
      case 'MoneyWithdrawn':
        this.balance -= event.data.amount;
        break;
    }
    this.version++;
  }

  static fromEvents(events) {
    const account = new BankAccount(events[0].data.id);
    events.forEach(event => account.apply(event));
    return account;
  }
}

module.exports = {
  Event,
  EventStore,
  BankAccount
};
EOF

cat > EventSourcing/index.js << 'EOF'
const { Event, EventStore, BankAccount } = require('./EventSourcing');

console.log('=== Event Sourcing Pattern Demo ===\n');

const eventStore = new EventStore();

console.log('1. Creating account');
eventStore.append(new Event('AccountCreated', { id: 'acc-1', initialBalance: 0 }));

console.log('2. Depositing money');
eventStore.append(new Event('MoneyDeposited', { id: 'acc-1', amount: 100 }));
eventStore.append(new Event('MoneyDeposited', { id: 'acc-1', amount: 50 }));

console.log('3. Withdrawing money');
eventStore.append(new Event('MoneyWithdrawn', { id: 'acc-1', amount: 30 }));

console.log('\n4. Rebuilding account from events');
const events = eventStore.getEvents('acc-1');
const account = BankAccount.fromEvents(events);
console.log(`   Account balance: $${account.balance}`);
console.log(`   Account version: ${account.version}`);

console.log('\n5. Event history');
eventStore.getAllEvents().forEach(e => {
  console.log(`   ${e.type}: ${JSON.stringify(e.data)}`);
});

console.log('\n=== Benefits ===');
console.log('✓ Complete audit trail');
console.log('✓ Temporal queries');
console.log('✓ Event replay capability');
EOF

cat > EventSourcing/README.md << 'EOF'
# Event Sourcing Pattern

## Intent
Store state changes as events to enable temporal queries and audit trails.

## Use When
- Audit trail is required
- Need to rebuild state at any point in time
- Event replay is needed

## Run
`node index.js`
EOF

# IdentityMap
mkdir -p IdentityMap
cat > IdentityMap/IdentityMap.js << 'EOF'
/**
 * Identity Map Pattern
 */

class IdentityMap {
  constructor() {
    this.map = new Map();
  }

  get(id) {
    return this.map.get(id);
  }

  put(id, object) {
    this.map.set(id, object);
  }

  has(id) {
    return this.map.has(id);
  }

  remove(id) {
    this.map.delete(id);
  }

  clear() {
    this.map.clear();
  }
}

class User {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

class UserRepository {
  constructor() {
    this.identityMap = new IdentityMap();
    this.database = new Map([
      ['1', { id: '1', name: 'John', email: 'john@example.com' }],
      ['2', { id: '2', name: 'Jane', email: 'jane@example.com' }]
    ]);
  }

  findById(id) {
    if (this.identityMap.has(id)) {
      console.log(`   [Cache Hit] User ${id} found in Identity Map`);
      return this.identityMap.get(id);
    }

    console.log(`   [Cache Miss] Loading User ${id} from database`);
    const data = this.database.get(id);
    if (data) {
      const user = new User(data.id, data.name, data.email);
      this.identityMap.put(id, user);
      return user;
    }
    return null;
  }
}

module.exports = {
  IdentityMap,
  User,
  UserRepository
};
EOF

cat > IdentityMap/index.js << 'EOF'
const { UserRepository } = require('./IdentityMap');

console.log('=== Identity Map Pattern Demo ===\n');

const repo = new UserRepository();

console.log('1. First access - loads from database');
const user1 = repo.findById('1');
console.log(`   User: ${user1.name}`);

console.log('\n2. Second access - returns from cache');
const user1Again = repo.findById('1');
console.log(`   Same object: ${user1 === user1Again}`);

console.log('\n3. Different user - loads from database');
const user2 = repo.findById('2');
console.log(`   User: ${user2.name}`);

console.log('\n=== Benefits ===');
console.log('✓ Ensures single instance per identity');
console.log('✓ Reduces database queries');
console.log('✓ Prevents update conflicts');
EOF

cat > IdentityMap/README.md << 'EOF'
# Identity Map Pattern

## Intent
Ensure that each object is loaded only once by keeping every loaded object in a map.

## Use When
- Need to ensure object identity
- Want to reduce database queries
- Preventing duplicate object instances is important

## Run
`node index.js`
EOF

# LazyLoad
mkdir -p LazyLoad
cat > LazyLoad/LazyLoad.js << 'EOF'
/**
 * Lazy Load Pattern
 */

class User {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this._orders = null;
  }

  get orders() {
    if (this._orders === null) {
      console.log(`   [Lazy Load] Loading orders for user ${this.id}`);
      this._orders = this.loadOrders();
    }
    return this._orders;
  }

  loadOrders() {
    return [
      { id: '1', total: 99.99 },
      { id: '2', total: 149.99 }
    ];
  }
}

class VirtualProxy {
  constructor(loader) {
    this.loader = loader;
    this._realObject = null;
  }

  get realObject() {
    if (this._realObject === null) {
      console.log('   [Virtual Proxy] Loading real object');
      this._realObject = this.loader();
    }
    return this._realObject;
  }

  getData() {
    return this.realObject.getData();
  }
}

class ExpensiveObject {
  constructor() {
    console.log('   [ExpensiveObject] Expensive initialization');
  }

  getData() {
    return 'Expensive data';
  }
}

module.exports = {
  User,
  VirtualProxy,
  ExpensiveObject
};
EOF

cat > LazyLoad/index.js << 'EOF'
const { User, VirtualProxy, ExpensiveObject } = require('./LazyLoad');

console.log('=== Lazy Load Pattern Demo ===\n');

console.log('1. Lazy initialization');
const user = new User('1', 'John');
console.log(`   User created: ${user.name}`);
console.log('   Orders not loaded yet');

console.log('\n2. First access to orders');
console.log(`   Order count: ${user.orders.length}`);

console.log('\n3. Second access - already loaded');
console.log(`   Order count: ${user.orders.length}`);

console.log('\n4. Virtual Proxy');
const proxy = new VirtualProxy(() => new ExpensiveObject());
console.log('   Proxy created (real object not created yet)');
console.log(`   Getting data: ${proxy.getData()}`);

console.log('\n=== Benefits ===');
console.log('✓ Defers expensive operations');
console.log('✓ Improves performance');
console.log('✓ Reduces memory usage');
EOF

cat > LazyLoad/README.md << 'EOF'
# Lazy Load Pattern

## Intent
Defer initialization of an object until it's needed.

## Use When
- Object creation is expensive
- Object might not be used
- Want to optimize performance

## Run
`node index.js`
EOF

