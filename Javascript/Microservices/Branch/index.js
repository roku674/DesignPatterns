const Branch = require('./Branch');

const pattern = new Branch({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
