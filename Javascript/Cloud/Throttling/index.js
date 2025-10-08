const Throttling = require('./Throttling');

const pattern = new Throttling({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
