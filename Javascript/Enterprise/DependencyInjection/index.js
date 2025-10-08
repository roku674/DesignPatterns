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
