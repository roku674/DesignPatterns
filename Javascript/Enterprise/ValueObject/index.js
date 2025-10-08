const { Address, Money } = require('./ValueObject');

console.log('=== Value Object Pattern Demo ===\n');

console.log('1. Creating addresses');
const addr1 = new Address('123 Main St', 'Springfield', 'IL', '62701');
const addr2 = new Address('123 Main St', 'Springfield', 'IL', '62701');
console.log(`   Address 1: ${addr1}`);
console.log(`   Address 2: ${addr2}`);
console.log(`   Are equal: ${addr1.equals(addr2)}`);

console.log('\n2. Immutability test');
try {
  addr1.street = '456 Oak Ave';
  console.log('   ✗ Should not be able to modify');
} catch (error) {
  console.log('   ✓ Cannot modify - object is frozen');
}

console.log('\n3. Money value objects');
const price1 = new Money(100, 'USD');
const price2 = new Money(50, 'USD');
const total = price1.add(price2);
console.log(`   ${price1} + ${price2} = ${total}`);

console.log('\n=== Benefits ===');
console.log('✓ Immutable objects');
console.log('✓ Value-based equality');
console.log('✓ No identity');
console.log('✓ Thread-safe');
