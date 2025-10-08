const { PremiumCustomerSpec, HighSpenderSpec } = require('./Specification');

console.log('=== Specification Pattern Demo ===\n');

const customers = [
  { name: 'John', isPremium: true, totalSpent: 1500 },
  { name: 'Jane', isPremium: false, totalSpent: 2000 },
  { name: 'Bob', isPremium: true, totalSpent: 500 }
];

console.log('1. Premium customer specification');
const premiumSpec = new PremiumCustomerSpec();
customers.forEach(c => {
  console.log(`   ${c.name} is premium: ${premiumSpec.isSatisfiedBy(c)}`);
});

console.log('\n2. High spender specification');
const highSpenderSpec = new HighSpenderSpec(1000);
customers.forEach(c => {
  console.log(`   ${c.name} is high spender: ${highSpenderSpec.isSatisfiedBy(c)}`);
});

console.log('\n3. Combined specification (Premium AND High Spender)');
const combinedSpec = premiumSpec.and(highSpenderSpec);
customers.forEach(c => {
  console.log(`   ${c.name} matches: ${combinedSpec.isSatisfiedBy(c)}`);
});

console.log('\n=== Benefits ===');
console.log('✓ Encapsulates business rules');
console.log('✓ Composable specifications');
console.log('✓ Reusable logic');
