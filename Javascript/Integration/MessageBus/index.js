const MessageBus = require('./MessageBus');

const pattern = new MessageBus({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
