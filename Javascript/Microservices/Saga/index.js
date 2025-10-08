const Saga = require('./Saga');

const pattern = new Saga({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
