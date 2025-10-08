const { UserRepository } = require('./IdentityMap');

console.log('=== Identity Map Pattern Demo ===\n');

const repo = new UserRepository();

console.log('1. First access - loads from database');
const user1 = repo.findById('1');
console.log(`   User: ${user1.name}`);

console.log('\n2. Second access - returns from cache');
const user1Again = repo.findById('1');
console.log(`   Same object: ${user1 === user1Again}`);

console.log('\n3. Different user - loads from database');
const user2 = repo.findById('2');
console.log(`   User: ${user2.name}`);

console.log('\n=== Benefits ===');
console.log('✓ Ensures single instance per identity');
console.log('✓ Reduces database queries');
console.log('✓ Prevents update conflicts');
