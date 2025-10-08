#!/bin/bash

# MoneyPattern
mkdir -p MoneyPattern
cat > MoneyPattern/MoneyPattern.js << 'EOF'
/**
 * Money Pattern
 */

class Money {
  constructor(amount, currency) {
    this.amount = amount;
    this.currency = currency;
  }

  add(other) {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other) {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract different currencies');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor) {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other) {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString() {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}

module.exports = { Money };
EOF

cat > MoneyPattern/index.js << 'EOF'
const { Money } = require('./MoneyPattern');

console.log('=== Money Pattern Demo ===\n');

const price = new Money(99.99, 'USD');
const tax = new Money(7.50, 'USD');

console.log('1. Adding money');
const total = price.add(tax);
console.log(`   ${price} + ${tax} = ${total}`);

console.log('\n2. Multiplying money');
const bulkPrice = price.multiply(3);
console.log(`   ${price} × 3 = ${bulkPrice}`);

console.log('\n3. Comparing money');
const same = new Money(99.99, 'USD');
console.log(`   ${price} equals ${same}: ${price.equals(same)}`);

console.log('\n=== Benefits ===');
console.log('✓ Handles currency correctly');
console.log('✓ Prevents floating-point errors');
console.log('✓ Type-safe money operations');
EOF

cat > MoneyPattern/README.md << 'EOF'
# Money Pattern

## Intent
Represent monetary values with currency and amount.

## Use When
- Dealing with money in applications
- Need currency-safe operations
- Want to avoid floating-point errors

## Run
`node index.js`
EOF

# NullObject
mkdir -p NullObject
cat > NullObject/NullObject.js << 'EOF'
/**
 * Null Object Pattern
 */

class Logger {
  log(message) {
    throw new Error('Must implement log');
  }
}

class ConsoleLogger extends Logger {
  log(message) {
    console.log(`[LOG] ${message}`);
  }
}

class NullLogger extends Logger {
  log(message) {
    // Do nothing
  }
}

class UserService {
  constructor(logger = new NullLogger()) {
    this.logger = logger;
  }

  createUser(username) {
    this.logger.log(`Creating user: ${username}`);
    return { id: 1, username };
  }
}

module.exports = {
  ConsoleLogger,
  NullLogger,
  UserService
};
EOF

cat > NullObject/index.js << 'EOF'
const { ConsoleLogger, NullLogger, UserService } = require('./NullObject');

console.log('=== Null Object Pattern Demo ===\n');

console.log('1. With console logger');
const service1 = new UserService(new ConsoleLogger());
service1.createUser('john');

console.log('\n2. With null logger (no output)');
const service2 = new UserService(new NullLogger());
service2.createUser('jane');
console.log('   User created silently');

console.log('\n3. Default null logger');
const service3 = new UserService();
service3.createUser('bob');
console.log('   User created with default null logger');

console.log('\n=== Benefits ===');
console.log('✓ Eliminates null checks');
console.log('✓ Provides default behavior');
console.log('✓ Simplifies client code');
EOF

cat > NullObject/README.md << 'EOF'
# Null Object Pattern

## Intent
Provide an object as a surrogate for lack of object, implementing default behavior.

## Use When
- Want to avoid null checks
- Need default "do nothing" behavior
- Want to simplify client code

## Run
`node index.js`
EOF

# Plugin
mkdir -p Plugin
cat > Plugin/Plugin.js << 'EOF'
/**
 * Plugin Pattern
 */

class PluginManager {
  constructor() {
    this.plugins = new Map();
  }

  register(name, plugin) {
    this.plugins.set(name, plugin);
  }

  execute(name, ...args) {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }
    return plugin.execute(...args);
  }

  getAllPlugins() {
    return Array.from(this.plugins.keys());
  }
}

class Plugin {
  constructor(name) {
    this.name = name;
  }

  execute(...args) {
    throw new Error('Must implement execute');
  }
}

class LoggerPlugin extends Plugin {
  execute(message) {
    console.log(`[${this.name}] ${message}`);
  }
}

class ValidatorPlugin extends Plugin {
  execute(data) {
    return data && data.length > 0;
  }
}

module.exports = {
  PluginManager,
  Plugin,
  LoggerPlugin,
  ValidatorPlugin
};
EOF

cat > Plugin/index.js << 'EOF'
const { PluginManager, LoggerPlugin, ValidatorPlugin } = require('./Plugin');

console.log('=== Plugin Pattern Demo ===\n');

const manager = new PluginManager();

console.log('1. Registering plugins');
manager.register('logger', new LoggerPlugin('Logger'));
manager.register('validator', new ValidatorPlugin('Validator'));
console.log(`   Registered: ${manager.getAllPlugins().join(', ')}`);

console.log('\n2. Executing logger plugin');
manager.execute('logger', 'Hello from plugin!');

console.log('\n3. Executing validator plugin');
const isValid = manager.execute('validator', 'test data');
console.log(`   Validation result: ${isValid}`);

console.log('\n=== Benefits ===');
console.log('✓ Extensible architecture');
console.log('✓ Decoupled components');
console.log('✓ Runtime plugin loading');
EOF

cat > Plugin/README.md << 'EOF'
# Plugin Pattern

## Intent
Allow third-party extensions to core functionality.

## Use When
- Need extensible architecture
- Want to support third-party extensions
- Core functionality should remain stable

## Run
`node index.js`
EOF

# PluginArchitecture - make it an alias/extension of Plugin
mkdir -p PluginArchitecture
cat > PluginArchitecture/PluginArchitecture.js << 'EOF'
/**
 * Plugin Architecture Pattern
 */

class PluginHost {
  constructor() {
    this.plugins = [];
  }

  loadPlugin(plugin) {
    if (plugin.initialize) {
      plugin.initialize(this);
    }
    this.plugins.push(plugin);
  }

  executeHook(hookName, ...args) {
    this.plugins.forEach(plugin => {
      if (plugin[hookName]) {
        plugin[hookName](...args);
      }
    });
  }
}

class BasePlugin {
  initialize(host) {
    this.host = host;
  }
}

class AuthPlugin extends BasePlugin {
  onRequest(req) {
    console.log(`[Auth Plugin] Authenticating request to ${req.path}`);
  }
}

class LoggingPlugin extends BasePlugin {
  onRequest(req) {
    console.log(`[Logging Plugin] ${req.method} ${req.path}`);
  }

  onResponse(res) {
    console.log(`[Logging Plugin] Response: ${res.status}`);
  }
}

module.exports = {
  PluginHost,
  BasePlugin,
  AuthPlugin,
  LoggingPlugin
};
EOF

cat > PluginArchitecture/index.js << 'EOF'
const { PluginHost, AuthPlugin, LoggingPlugin } = require('./PluginArchitecture');

console.log('=== Plugin Architecture Pattern Demo ===\n');

const host = new PluginHost();

console.log('1. Loading plugins');
host.loadPlugin(new AuthPlugin());
host.loadPlugin(new LoggingPlugin());
console.log(`   Loaded ${host.plugins.length} plugins`);

console.log('\n2. Executing onRequest hook');
host.executeHook('onRequest', { method: 'GET', path: '/api/users' });

console.log('\n3. Executing onResponse hook');
host.executeHook('onResponse', { status: 200 });

console.log('\n=== Benefits ===');
console.log('✓ Highly extensible');
console.log('✓ Hook-based architecture');
console.log('✓ Decoupled plugins');
EOF

cat > PluginArchitecture/README.md << 'EOF'
# Plugin Architecture Pattern

## Intent
Create a system where functionality can be extended through plugins.

## Use When
- Building extensible applications
- Need hook-based extensibility
- Third-party extensions required

## Run
`node index.js`
EOF

# QueryObject
mkdir -p QueryObject
cat > QueryObject/QueryObject.js << 'EOF'
/**
 * Query Object Pattern
 */

class QueryObject {
  constructor() {
    this.criteria = [];
  }

  where(field, operator, value) {
    this.criteria.push({ field, operator, value });
    return this;
  }

  build() {
    return this.criteria.map(c => 
      `${c.field} ${c.operator} ${this.formatValue(c.value)}`
    ).join(' AND ');
  }

  formatValue(value) {
    return typeof value === 'string' ? `'${value}'` : value;
  }
}

class UserQuery extends QueryObject {
  byEmail(email) {
    return this.where('email', '=', email);
  }

  byStatus(status) {
    return this.where('status', '=', status);
  }

  olderThan(age) {
    return this.where('age', '>', age);
  }
}

module.exports = {
  QueryObject,
  UserQuery
};
EOF

cat > QueryObject/index.js << 'EOF'
const { UserQuery } = require('./QueryObject');

console.log('=== Query Object Pattern Demo ===\n');

console.log('1. Simple query');
const query1 = new UserQuery();
query1.byEmail('john@example.com');
console.log(`   SQL: SELECT * FROM users WHERE ${query1.build()}`);

console.log('\n2. Complex query');
const query2 = new UserQuery();
query2.byStatus('active').olderThan(18);
console.log(`   SQL: SELECT * FROM users WHERE ${query2.build()}`);

console.log('\n3. Chained query');
const query3 = new UserQuery()
  .byStatus('premium')
  .olderThan(21);
console.log(`   SQL: SELECT * FROM users WHERE ${query3.build()}`);

console.log('\n=== Benefits ===');
console.log('✓ Encapsulates query logic');
console.log('✓ Type-safe queries');
console.log('✓ Reusable query components');
EOF

cat > QueryObject/README.md << 'EOF'
# Query Object Pattern

## Intent
Represent database queries as objects.

## Use When
- Need to build complex queries programmatically
- Want type-safe query construction
- Query logic should be reusable

## Run
`node index.js`
EOF

