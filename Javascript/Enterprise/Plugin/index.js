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
