const BulkheadCloud = require('./BulkheadCloud');

const pattern = new BulkheadCloud({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
