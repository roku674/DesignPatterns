const { Saga } = require('./Saga');

console.log('=== Saga Pattern Demo ===\n');

console.log('1. Successful saga');
const successSaga = new Saga('OrderSaga');
successSaga
  .addStep('Reserve Inventory',
    async () => console.log('      Inventory reserved'),
    async () => console.log('      Inventory released'))
  .addStep('Process Payment',
    async () => console.log('      Payment processed'),
    async () => console.log('      Payment refunded'))
  .addStep('Ship Order',
    async () => console.log('      Order shipped'),
    async () => console.log('      Shipment cancelled'));

successSaga.execute();

console.log('\n2. Failed saga with compensation');
const failedSaga = new Saga('FailedOrderSaga');
failedSaga
  .addStep('Reserve Inventory',
    async () => console.log('      Inventory reserved'),
    async () => console.log('      Inventory released'))
  .addStep('Process Payment',
    async () => { throw new Error('Payment declined'); },
    async () => console.log('      Payment refunded'));

setTimeout(() => {
  failedSaga.execute().then(() => {
    console.log('\n=== Benefits ===');
    console.log('✓ Distributed transaction management');
    console.log('✓ Automatic compensation on failure');
    console.log('✓ Eventual consistency');
  });
}, 100);
