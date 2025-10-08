const DoubleCheckedLocking = require('./DoubleCheckedLocking');

const pattern = new DoubleCheckedLocking({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
