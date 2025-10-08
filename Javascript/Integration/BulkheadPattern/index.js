const BulkheadPattern = require('./BulkheadPattern');

const pattern = new BulkheadPattern({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
