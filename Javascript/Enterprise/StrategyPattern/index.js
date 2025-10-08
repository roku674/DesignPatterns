const { RegularPricing, MemberPricing, VIPPricing, Order } = require('./StrategyPattern');

console.log('=== Strategy Pattern Demo ===\n');

const items = [
  { name: 'Product A', price: 100 },
  { name: 'Product B', price: 50 }
];

console.log('1. Regular pricing');
const order1 = new Order(items, new RegularPricing());
console.log(`   Total: $${order1.calculateTotal()}`);

console.log('\n2. Member pricing');
const order2 = new Order(items, new MemberPricing());
console.log(`   Total: $${order2.calculateTotal()}`);

console.log('\n3. VIP pricing');
const order3 = new Order(items, new VIPPricing());
console.log(`   Total: $${order3.calculateTotal()}`);

console.log('\n4. Changing strategy at runtime');
order1.setPricingStrategy(new VIPPricing());
console.log(`   New total: $${order1.calculateTotal()}`);

console.log('\n=== Benefits ===');
console.log('✓ Interchangeable algorithms');
console.log('✓ Runtime strategy switching');
console.log('✓ Eliminates conditionals');
