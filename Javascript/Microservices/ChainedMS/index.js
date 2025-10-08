const ChainedMS = require('./ChainedMS');

const pattern = new ChainedMS({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
