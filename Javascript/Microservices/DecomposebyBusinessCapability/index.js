const DecomposebyBusinessCapability = require('./DecomposebyBusinessCapability');

const pattern = new DecomposebyBusinessCapability({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
