const CompensatingTransaction = require('./CompensatingTransaction');

const pattern = new CompensatingTransaction({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
