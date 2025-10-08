const Aggregator = require('./Aggregator');

const pattern = new Aggregator({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
