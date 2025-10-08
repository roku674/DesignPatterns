const MessageRouter = require('./MessageRouter');

const pattern = new MessageRouter({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
