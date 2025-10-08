const { PremiumCustomerSpec, HighSpenderSpec } = require('./SpecificationPattern');

console.log('=== Specification Pattern Demo ===\n');

const customer = { name: 'Premium John', isPremium: true, totalSpent: 5000 };

const premiumSpec = new PremiumCustomerSpec();
const highSpenderSpec = new HighSpenderSpec(1000);

console.log(`1. Is ${customer.name} premium? ${premiumSpec.isSatisfiedBy(customer)}`);
console.log(`2. Is ${customer.name} high spender? ${highSpenderSpec.isSatisfiedBy(customer)}`);

const vipSpec = premiumSpec.and(highSpenderSpec);
console.log(`3. Is ${customer.name} VIP? ${vipSpec.isSatisfiedBy(customer)}`);

console.log('\n=== Benefits ===');
console.log('✓ Business rule encapsulation');
console.log('✓ Specification composition');
console.log('✓ Testable business logic');
