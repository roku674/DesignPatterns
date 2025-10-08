const PollingConsumer = require('./PollingConsumer');

const pattern = new PollingConsumer({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
