const MessageBridge = require('./MessageBridge');

const pattern = new MessageBridge({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
