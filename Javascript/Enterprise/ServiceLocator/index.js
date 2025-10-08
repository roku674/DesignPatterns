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
