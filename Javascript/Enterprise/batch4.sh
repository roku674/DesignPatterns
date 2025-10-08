#!/bin/bash

# RegistryPattern (similar to Registry but distinct)
mkdir -p RegistryPattern
cat > RegistryPattern/RegistryPattern.js << 'EOF'
/**
 * Registry Pattern
 */

class Registry {
  constructor() {
    this.services = new Map();
  }

  static getInstance() {
    if (!Registry.instance) {
      Registry.instance = new Registry();
    }
    return Registry.instance;
  }

  register(name, service) {
    this.services.set(name, service);
  }

  get(name) {
    if (!this.services.has(name)) {
      throw new Error(`Service ${name} not registered`);
    }
    return this.services.get(name);
  }

  has(name) {
    return this.services.has(name);
  }
}

module.exports = { Registry };
EOF

cat > RegistryPattern/index.js << 'EOF'
const { Registry } = require('./RegistryPattern');

console.log('=== Registry Pattern Demo ===\n');

const registry = Registry.getInstance();

console.log('1. Registering services');
registry.register('database', { connection: 'mysql://localhost' });
registry.register('logger', { log: (msg) => console.log(`[LOG] ${msg}`) });

console.log('\n2. Retrieving services');
const db = registry.get('database');
console.log(`   Database: ${db.connection}`);

const logger = registry.get('logger');
logger.log('Service retrieved from registry');

console.log('\n3. Checking service existence');
console.log(`   Has 'database': ${registry.has('database')}`);
console.log(`   Has 'cache': ${registry.has('cache')}`);

console.log('\n=== Benefits ===');
console.log('✓ Global service access');
console.log('✓ Centralized configuration');
console.log('✓ Service location pattern');
EOF

cat > RegistryPattern/README.md << 'EOF'
# Registry Pattern

## Intent
Provide a centralized location for storing and retrieving services.

## Use When
- Need global access to services
- Want centralized service management
- Service locator is required

## Run
`node index.js`
EOF

# RowDataGateway
mkdir -p RowDataGateway
cat > RowDataGateway/RowDataGateway.js << 'EOF'
/**
 * Row Data Gateway Pattern
 */

class PersonGateway {
  constructor(id, firstName, lastName, email) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }

  insert() {
    console.log(`   [DB] INSERT INTO persons VALUES (${this.id}, '${this.firstName}', '${this.lastName}', '${this.email}')`);
    return this;
  }

  update() {
    console.log(`   [DB] UPDATE persons SET firstName='${this.firstName}', lastName='${this.lastName}', email='${this.email}' WHERE id=${this.id}`);
    return this;
  }

  delete() {
    console.log(`   [DB] DELETE FROM persons WHERE id=${this.id}`);
  }

  static find(id) {
    console.log(`   [DB] SELECT * FROM persons WHERE id=${id}`);
    return new PersonGateway(id, 'John', 'Doe', 'john@example.com');
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

module.exports = { PersonGateway };
EOF

cat > RowDataGateway/index.js << 'EOF'
const { PersonGateway } = require('./RowDataGateway');

console.log('=== Row Data Gateway Pattern Demo ===\n');

console.log('1. Creating new person');
const person = new PersonGateway(1, 'Jane', 'Smith', 'jane@example.com');
person.insert();

console.log('\n2. Finding person');
const found = PersonGateway.find(1);
console.log(`   Found: ${found.getFullName()}`);

console.log('\n3. Updating person');
found.email = 'jane.smith@example.com';
found.update();

console.log('\n4. Deleting person');
found.delete();

console.log('\n=== Benefits ===');
console.log('✓ One gateway instance per row');
console.log('✓ Encapsulates database access');
console.log('✓ Simple CRUD operations');
EOF

cat > RowDataGateway/README.md << 'EOF'
# Row Data Gateway Pattern

## Intent
An object that acts as a gateway to a single row in a database table.

## Use When
- Simple database access is needed
- One object represents one table row
- CRUD operations are straightforward

## Run
`node index.js`
EOF

# Saga
mkdir -p Saga
cat > Saga/Saga.js << 'EOF'
/**
 * Saga Pattern
 */

class SagaStep {
  constructor(name, action, compensation) {
    this.name = name;
    this.action = action;
    this.compensation = compensation;
  }
}

class Saga {
  constructor(name) {
    this.name = name;
    this.steps = [];
    this.completedSteps = [];
  }

  addStep(name, action, compensation) {
    this.steps.push(new SagaStep(name, action, compensation));
    return this;
  }

  async execute() {
    try {
      for (const step of this.steps) {
        console.log(`   Executing: ${step.name}`);
        await step.action();
        this.completedSteps.push(step);
      }
      console.log(`   ✓ Saga ${this.name} completed successfully`);
      return true;
    } catch (error) {
      console.log(`   ✗ Saga ${this.name} failed: ${error.message}`);
      await this.compensate();
      return false;
    }
  }

  async compensate() {
    console.log(`   Starting compensation for ${this.name}`);
    for (let i = this.completedSteps.length - 1; i >= 0; i--) {
      const step = this.completedSteps[i];
      console.log(`   Compensating: ${step.name}`);
      await step.compensation();
    }
    console.log(`   ✓ Compensation completed`);
  }
}

module.exports = { Saga };
EOF

cat > Saga/index.js << 'EOF'
const { Saga } = require('./Saga');

console.log('=== Saga Pattern Demo ===\n');

console.log('1. Successful saga');
const successSaga = new Saga('OrderSaga');
successSaga
  .addStep('Reserve Inventory',
    async () => console.log('      Inventory reserved'),
    async () => console.log('      Inventory released'))
  .addStep('Process Payment',
    async () => console.log('      Payment processed'),
    async () => console.log('      Payment refunded'))
  .addStep('Ship Order',
    async () => console.log('      Order shipped'),
    async () => console.log('      Shipment cancelled'));

successSaga.execute();

console.log('\n2. Failed saga with compensation');
const failedSaga = new Saga('FailedOrderSaga');
failedSaga
  .addStep('Reserve Inventory',
    async () => console.log('      Inventory reserved'),
    async () => console.log('      Inventory released'))
  .addStep('Process Payment',
    async () => { throw new Error('Payment declined'); },
    async () => console.log('      Payment refunded'));

setTimeout(() => {
  failedSaga.execute().then(() => {
    console.log('\n=== Benefits ===');
    console.log('✓ Distributed transaction management');
    console.log('✓ Automatic compensation on failure');
    console.log('✓ Eventual consistency');
  });
}, 100);
EOF

cat > Saga/README.md << 'EOF'
# Saga Pattern

## Intent
Manage distributed transactions with compensation logic for failures.

## Use When
- Distributed transactions are needed
- ACID transactions are not available
- Need to handle partial failures

## Run
`node index.js`
EOF

# Serialization
mkdir -p Serialization
cat > Serialization/Serialization.js << 'EOF'
/**
 * Serialization Pattern
 */

class Serializer {
  serialize(obj) {
    throw new Error('Must implement serialize');
  }

  deserialize(data) {
    throw new Error('Must implement deserialize');
  }
}

class JSONSerializer extends Serializer {
  serialize(obj) {
    return JSON.stringify(obj);
  }

  deserialize(data) {
    return JSON.parse(data);
  }
}

class XMLSerializer extends Serializer {
  serialize(obj) {
    return `<object>${this.toXML(obj)}</object>`;
  }

  toXML(obj) {
    return Object.entries(obj)
      .map(([key, value]) => `<${key}>${value}</${key}>`)
      .join('');
  }

  deserialize(data) {
    const obj = {};
    const matches = data.matchAll(/<(\w+)>(.*?)<\/\1>/g);
    for (const match of matches) {
      obj[match[1]] = match[2];
    }
    return obj;
  }
}

class SerializableUser {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  serialize(serializer) {
    return serializer.serialize(this);
  }

  static deserialize(data, serializer) {
    const obj = serializer.deserialize(data);
    return new SerializableUser(obj.id, obj.name, obj.email);
  }
}

module.exports = {
  JSONSerializer,
  XMLSerializer,
  SerializableUser
};
EOF

cat > Serialization/index.js << 'EOF'
const { JSONSerializer, XMLSerializer, SerializableUser } = require('./Serialization');

console.log('=== Serialization Pattern Demo ===\n');

const user = new SerializableUser(1, 'John Doe', 'john@example.com');

console.log('1. JSON Serialization');
const jsonSerializer = new JSONSerializer();
const jsonData = user.serialize(jsonSerializer);
console.log(`   Serialized: ${jsonData}`);
const jsonUser = SerializableUser.deserialize(jsonData, jsonSerializer);
console.log(`   Deserialized: ${jsonUser.name}`);

console.log('\n2. XML Serialization');
const xmlSerializer = new XMLSerializer();
const xmlData = user.serialize(xmlSerializer);
console.log(`   Serialized: ${xmlData}`);
const xmlUser = SerializableUser.deserialize(xmlData, xmlSerializer);
console.log(`   Deserialized: ${xmlUser.name}`);

console.log('\n=== Benefits ===');
console.log('✓ Format-agnostic serialization');
console.log('✓ Easy to swap serializers');
console.log('✓ Supports multiple formats');
EOF

cat > Serialization/README.md << 'EOF'
# Serialization Pattern

## Intent
Convert objects to/from a format suitable for storage or transmission.

## Use When
- Need to persist objects
- Want to transfer objects over network
- Multiple serialization formats required

## Run
`node index.js`
EOF

# ServiceLocator
mkdir -p ServiceLocator
cat > ServiceLocator/ServiceLocator.js << 'EOF'
/**
 * Service Locator Pattern
 */

class ServiceLocator {
  constructor() {
    this.services = new Map();
  }

  static getInstance() {
    if (!ServiceLocator.instance) {
      ServiceLocator.instance = new ServiceLocator();
    }
    return ServiceLocator.instance;
  }

  registerService(name, service) {
    this.services.set(name, service);
  }

  getService(name) {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service;
  }
}

class EmailService {
  send(to, message) {
    console.log(`   Sending email to ${to}: ${message}`);
  }
}

class DatabaseService {
  query(sql) {
    console.log(`   Executing query: ${sql}`);
    return [];
  }
}

module.exports = {
  ServiceLocator,
  EmailService,
  DatabaseService
};
EOF

cat > ServiceLocator/index.js << 'EOF'
const { ServiceLocator, EmailService, DatabaseService } = require('./ServiceLocator');

console.log('=== Service Locator Pattern Demo ===\n');

const locator = ServiceLocator.getInstance();

console.log('1. Registering services');
locator.registerService('email', new EmailService());
locator.registerService('database', new DatabaseService());

console.log('\n2. Using email service');
const emailService = locator.getService('email');
emailService.send('user@example.com', 'Hello!');

console.log('\n3. Using database service');
const dbService = locator.getService('database');
dbService.query('SELECT * FROM users');

console.log('\n=== Benefits ===');
console.log('✓ Centralized service management');
console.log('✓ Loose coupling');
console.log('✓ Runtime service resolution');
EOF

cat > ServiceLocator/README.md << 'EOF'
# Service Locator Pattern

## Intent
Provide a centralized registry for locating services.

## Use When
- Need runtime service resolution
- Want to decouple service consumers from providers
- Centralized service management is required

## Run
`node index.js`
EOF

