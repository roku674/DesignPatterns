const { Customer, Plan, UnknownCustomer } = require('./SpecialCase');

console.log('=== Special Case Pattern Demo ===\n');

console.log('1. Regular customer');
const customer1 = new Customer('John Doe', 'john@example.com', new Plan('Premium', 15));
console.log(`   ${customer1.name} gets ${customer1.getDiscount()}% discount`);

console.log('\n2. Unknown customer (special case)');
const customer2 = new UnknownCustomer();
console.log(`   ${customer2.name} gets ${customer2.getDiscount()}% discount`);

console.log('\n3. Processing without null checks');
[customer1, customer2].forEach(c => {
  console.log(`   Processing ${c.name}: ${c.getDiscount()}% discount`);
});

console.log('\n=== Benefits ===');
console.log('✓ Eliminates null checks');
console.log('✓ Provides default behavior');
console.log('✓ Makes code cleaner');
