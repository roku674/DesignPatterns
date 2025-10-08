const { VendingMachine } = require('./vending-machine');

console.log('=== State Pattern Demo ===\n');

const machine = new VendingMachine();

console.log('Trying to dispense without coin:');
machine.dispense();

console.log('\nInserting coin:');
machine.insertCoin();

console.log('\nDispensing:');
machine.dispense();

console.log('\nInserting coin again:');
machine.insertCoin();

console.log('\nEjecting coin:');
machine.ejectCoin();

console.log('\n=== Demo Complete ===');
