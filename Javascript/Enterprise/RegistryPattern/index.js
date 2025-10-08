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
