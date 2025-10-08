const Gateway = require('./Gateway');

const pattern = new Gateway({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
