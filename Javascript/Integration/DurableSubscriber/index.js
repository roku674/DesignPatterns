const DurableSubscriber = require('./DurableSubscriber');

const pattern = new DurableSubscriber({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
