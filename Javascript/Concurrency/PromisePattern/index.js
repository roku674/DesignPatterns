const PromisePattern = require('./PromisePattern');

const pattern = new PromisePattern({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
