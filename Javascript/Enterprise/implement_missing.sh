#!/bin/bash

# DataTransferObject
mkdir -p DataTransferObject
cat > DataTransferObject/DataTransferObject.js << 'EOF'
/**
 * Data Transfer Object (DTO) Pattern
 * 
 * An object that carries data between processes to reduce method calls.
 */

/**
 * User DTO
 */
class UserDTO {
  constructor(id, username, email, firstName, lastName) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  /**
   * Get full name
   * @returns {string} Full name
   */
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Convert to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName
    };
  }
}

/**
 * Order DTO
 */
class OrderDTO {
  constructor(orderId, customerId, items, totalAmount, orderDate) {
    this.orderId = orderId;
    this.customerId = customerId;
    this.items = items;
    this.totalAmount = totalAmount;
    this.orderDate = orderDate;
  }

  /**
   * Get item count
   * @returns {number} Total items
   */
  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Convert to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      orderId: this.orderId,
      customerId: this.customerId,
      items: this.items,
      totalAmount: this.totalAmount,
      orderDate: this.orderDate
    };
  }
}

/**
 * DTO Assembler - Converts domain objects to DTOs
 */
class DTOAssembler {
  /**
   * Create UserDTO from domain object
   * @param {Object} user - Domain user object
   * @returns {UserDTO} User DTO
   */
  static createUserDTO(user) {
    return new UserDTO(
      user.id,
      user.username,
      user.email,
      user.profile.firstName,
      user.profile.lastName
    );
  }

  /**
   * Create OrderDTO from domain object
   * @param {Object} order - Domain order object
   * @returns {OrderDTO} Order DTO
   */
  static createOrderDTO(order) {
    return new OrderDTO(
      order.id,
      order.customer.id,
      order.lineItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price
      })),
      order.calculateTotal(),
      order.createdAt
    );
  }
}

module.exports = {
  UserDTO,
  OrderDTO,
  DTOAssembler
};
EOF

cat > DataTransferObject/index.js << 'EOF'
const { UserDTO, OrderDTO, DTOAssembler } = require('./DataTransferObject');

console.log('=== Data Transfer Object Pattern Demo ===\n');

console.log('1. Creating UserDTO directly');
const userDTO = new UserDTO('1', 'johndoe', 'john@example.com', 'John', 'Doe');
console.log('   User:', userDTO.getFullName());
console.log('   JSON:', JSON.stringify(userDTO.toJSON(), null, 2));

console.log('\n2. Creating OrderDTO');
const orderDTO = new OrderDTO(
  'ORD-001',
  'CUST-123',
  [
    { productId: 'P1', productName: 'Laptop', quantity: 1, price: 999.99 },
    { productId: 'P2', productName: 'Mouse', quantity: 2, price: 29.99 }
  ],
  1059.97,
  new Date()
);
console.log('   Order ID:', orderDTO.orderId);
console.log('   Total items:', orderDTO.getItemCount());
console.log('   Total amount: $' + orderDTO.totalAmount);

console.log('\n3. Using DTOAssembler');
const domainUser = {
  id: '2',
  username: 'janesmith',
  email: 'jane@example.com',
  profile: { firstName: 'Jane', lastName: 'Smith' }
};
const assembledUserDTO = DTOAssembler.createUserDTO(domainUser);
console.log('   Assembled user:', assembledUserDTO.getFullName());

console.log('\n=== Benefits ===');
console.log('✓ Reduces number of remote calls');
console.log('✓ Encapsulates serialization logic');
console.log('✓ Provides data structure for network transfer');
console.log('✓ Decouples domain model from presentation');
EOF

cat > DataTransferObject/README.md << 'EOF'
# Data Transfer Object Pattern

## Intent
An object that carries data between processes to reduce the number of method calls.

## Use When
- You need to transfer data across network boundaries
- You want to reduce the number of remote calls
- You need to aggregate data from multiple sources
- You want to decouple domain model from data transfer format

## Benefits
- Reduces network latency by batching data
- Simplifies remote interface
- Provides clear data contract
- Enables versioning of data structures

## Implementation
Run: `node index.js`
EOF

# DependencyInjection
mkdir -p DependencyInjection
cat > DependencyInjection/DependencyInjection.js << 'EOF'
/**
 * Dependency Injection Pattern
 * 
 * Provides dependencies to an object from external sources rather than
 * having the object create them itself.
 */

/**
 * Database interface
 */
class Database {
  query(sql) {
    throw new Error('Must implement query method');
  }
}

/**
 * MySQL Database implementation
 */
class MySQLDatabase extends Database {
  query(sql) {
    return `MySQL: Executing ${sql}`;
  }
}

/**
 * PostgreSQL Database implementation
 */
class PostgreSQLDatabase extends Database {
  query(sql) {
    return `PostgreSQL: Executing ${sql}`;
  }
}

/**
 * Logger interface
 */
class Logger {
  log(message) {
    throw new Error('Must implement log method');
  }
}

/**
 * Console Logger implementation
 */
class ConsoleLogger extends Logger {
  log(message) {
    console.log(`[LOG] ${message}`);
  }
}

/**
 * File Logger implementation
 */
class FileLogger extends Logger {
  log(message) {
    console.log(`[FILE] Writing to log: ${message}`);
  }
}

/**
 * User Service with constructor injection
 */
class UserService {
  constructor(database, logger) {
    this.database = database;
    this.logger = logger;
  }

  /**
   * Create a user
   * @param {string} username - Username
   */
  createUser(username) {
    this.logger.log(`Creating user: ${username}`);
    const result = this.database.query(`INSERT INTO users (username) VALUES ('${username}')`);
    this.logger.log(`User created: ${username}`);
    return result;
  }

  /**
   * Get a user
   * @param {number} id - User ID
   */
  getUser(id) {
    this.logger.log(`Fetching user: ${id}`);
    return this.database.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

/**
 * Simple DI Container
 */
class DIContainer {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }

  /**
   * Register a service
   * @param {string} name - Service name
   * @param {Function} factory - Factory function
   * @param {boolean} singleton - Whether to create singleton
   */
  register(name, factory, singleton = false) {
    this.services.set(name, { factory, singleton });
  }

  /**
   * Resolve a service
   * @param {string} name - Service name
   * @returns {*} Service instance
   */
  resolve(name) {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }

    if (service.singleton) {
      if (!this.singletons.has(name)) {
        this.singletons.set(name, service.factory(this));
      }
      return this.singletons.get(name);
    }

    return service.factory(this);
  }
}

module.exports = {
  Database,
  MySQLDatabase,
  PostgreSQLDatabase,
  Logger,
  ConsoleLogger,
  FileLogger,
  UserService,
  DIContainer
};
EOF

cat > DependencyInjection/index.js << 'EOF'
const {
  MySQLDatabase,
  PostgreSQLDatabase,
  ConsoleLogger,
  FileLogger,
  UserService,
  DIContainer
} = require('./DependencyInjection');

console.log('=== Dependency Injection Pattern Demo ===\n');

console.log('1. Constructor Injection');
const db1 = new MySQLDatabase();
const logger1 = new ConsoleLogger();
const userService1 = new UserService(db1, logger1);
userService1.createUser('john_doe');

console.log('\n2. Swapping Dependencies');
const db2 = new PostgreSQLDatabase();
const logger2 = new FileLogger();
const userService2 = new UserService(db2, logger2);
userService2.createUser('jane_smith');

console.log('\n3. Using DI Container');
const container = new DIContainer();

container.register('database', () => new MySQLDatabase(), true);
container.register('logger', () => new ConsoleLogger(), true);
container.register('userService', (c) => new UserService(
  c.resolve('database'),
  c.resolve('logger')
));

const userService3 = container.resolve('userService');
userService3.getUser(1);

console.log('\n=== Benefits ===');
console.log('✓ Loose coupling between components');
console.log('✓ Easy to test with mock dependencies');
console.log('✓ Flexible configuration');
console.log('✓ Single Responsibility Principle');
EOF

cat > DependencyInjection/README.md << 'EOF'
# Dependency Injection Pattern

## Intent
Provide dependencies to an object from external sources rather than having the object create them.

## Use When
- You want to decouple components
- You need to support testing with mocks
- Configuration should be external
- Multiple implementations exist

## Benefits
- Loose coupling
- Testability
- Flexibility
- Maintainability

## Run
`node index.js`
EOF

