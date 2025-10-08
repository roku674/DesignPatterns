const CQRS = require('./CQRS');

const pattern = new CQRS({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
