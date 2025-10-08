const TransactionalClient = require('./TransactionalClient');

const pattern = new TransactionalClient({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
