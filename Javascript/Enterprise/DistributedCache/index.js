const { DistributedCache } = require('./DistributedCache');

console.log('=== Distributed Cache Pattern Demo ===\n');

const cache = new DistributedCache(3);

console.log('1. Setting values across nodes');
cache.set('user:1', { name: 'John' }, 10000);
cache.set('user:2', { name: 'Jane' }, 10000);
cache.set('product:1', { name: 'Laptop' }, 10000);

console.log('\n2. Getting values');
console.log(`   user:1 = ${JSON.stringify(cache.get('user:1'))}`);
console.log(`   user:2 = ${JSON.stringify(cache.get('user:2'))}`);
console.log(`   product:1 = ${JSON.stringify(cache.get('product:1'))}`);

console.log('\n3. Checking existence');
console.log(`   Has user:1: ${cache.has('user:1')}`);
console.log(`   Has user:99: ${cache.has('user:99')}`);

console.log('\n=== Benefits ===');
console.log('✓ Horizontal scaling');
console.log('✓ Load distribution');
console.log('✓ High availability');
