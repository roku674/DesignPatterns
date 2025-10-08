const { Money, Account, Order, Product, Customer } = require('./DomainModel');

console.log('=== Domain Model Pattern Demo ===\n');

// Demonstrate Money operations
console.log('--- Money Value Object ---');
const money1 = new Money(100);
const money2 = new Money(50);
console.log(`${money1} + ${money2} = ${money1.add(money2)}`);
console.log(`${money1} - ${money2} = ${money1.subtract(money2)}`);
console.log(`${money1} * 2 = ${money1.multiply(2)}`);

// Demonstrate Account transfers
console.log('\n--- Account Transfers ---');
const account1 = new Account('ACC001', 'John Doe', new Money(1000));
const account2 = new Account('ACC002', 'Jane Smith', new Money(500));

console.log(`Account 1 initial balance: ${account1.balance}`);
console.log(`Account 2 initial balance: ${account2.balance}`);

account1.transferTo(account2, new Money(200));

console.log(`\nAfter transfer of ${new Money(200)}:`);
console.log(`Account 1 balance: ${account1.balance}`);
console.log(`Account 2 balance: ${account2.balance}`);

console.log('\nAccount 1 Statement:');
console.log(JSON.stringify(account1.getStatement(), null, 2));

// Demonstrate Order with business rules
console.log('\n--- Order Processing ---');
const customer = new Customer('C001', 'Bob Wilson', 'bob@example.com', 'premium');
const order = new Order('ORD001', customer);

const laptop = new Product('P001', 'Laptop', new Money(999));
const mouse = new Product('P002', 'Mouse', new Money(29));

order.addItem(laptop, 1);
order.addItem(mouse, 2);

console.log(`Order total (with premium 10% discount): ${order.getTotal()}`);
console.log(`Order status: ${order.status}`);

order.submit();
console.log(`\nAfter submit - Status: ${order.status}`);

order.approve();
console.log(`After approve - Status: ${order.status}`);

order.ship();
console.log(`After ship - Status: ${order.status}`);

// Try to modify shipped order (will fail)
console.log('\n--- Testing Business Rules ---');
try {
  order.addItem(laptop, 1);
} catch (error) {
  console.log(`Error caught: ${error.message}`);
}
