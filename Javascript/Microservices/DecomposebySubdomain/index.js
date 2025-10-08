const DecomposebySubdomain = require('./DecomposebySubdomain');

const pattern = new DecomposebySubdomain({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
