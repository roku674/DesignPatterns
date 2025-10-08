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
