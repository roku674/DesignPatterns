const TransactionLogTailing = require('./TransactionLogTailing');

const pattern = new TransactionLogTailing({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
