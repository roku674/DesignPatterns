const Sharding = require('./Sharding');

const pattern = new Sharding({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
