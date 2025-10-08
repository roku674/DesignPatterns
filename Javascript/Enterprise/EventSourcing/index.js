const { Event, EventStore, BankAccount } = require('./EventSourcing');

console.log('=== Event Sourcing Pattern Demo ===\n');

const eventStore = new EventStore();

console.log('1. Creating account');
eventStore.append(new Event('AccountCreated', { id: 'acc-1', initialBalance: 0 }));

console.log('2. Depositing money');
eventStore.append(new Event('MoneyDeposited', { id: 'acc-1', amount: 100 }));
eventStore.append(new Event('MoneyDeposited', { id: 'acc-1', amount: 50 }));

console.log('3. Withdrawing money');
eventStore.append(new Event('MoneyWithdrawn', { id: 'acc-1', amount: 30 }));

console.log('\n4. Rebuilding account from events');
const events = eventStore.getEvents('acc-1');
const account = BankAccount.fromEvents(events);
console.log(`   Account balance: $${account.balance}`);
console.log(`   Account version: ${account.version}`);

console.log('\n5. Event history');
eventStore.getAllEvents().forEach(e => {
  console.log(`   ${e.type}: ${JSON.stringify(e.data)}`);
});

console.log('\n=== Benefits ===');
console.log('✓ Complete audit trail');
console.log('✓ Temporal queries');
console.log('✓ Event replay capability');
