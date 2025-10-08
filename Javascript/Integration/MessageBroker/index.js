const MessageBroker = require('./MessageBroker');

const pattern = new MessageBroker({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
