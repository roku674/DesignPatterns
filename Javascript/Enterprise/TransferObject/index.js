const TransferObject = require('./TransferObject');

const pattern = new TransferObject({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
