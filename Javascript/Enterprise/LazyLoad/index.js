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
