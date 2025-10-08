const IdempotentReceiver = require('./IdempotentReceiver');

const pattern = new IdempotentReceiver({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
