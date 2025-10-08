const ClaimCheck = require('./ClaimCheck');

const pattern = new ClaimCheck({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
