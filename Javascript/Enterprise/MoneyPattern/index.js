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
