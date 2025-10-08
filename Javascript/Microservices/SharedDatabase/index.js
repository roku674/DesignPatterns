const SharedDatabase = require('./SharedDatabase');

const pattern = new SharedDatabase({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
