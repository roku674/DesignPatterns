const Bulkhead = require('./Bulkhead');

const pattern = new Bulkhead({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
