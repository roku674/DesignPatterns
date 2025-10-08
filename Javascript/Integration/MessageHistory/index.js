const MessageHistory = require('./MessageHistory');

const pattern = new MessageHistory({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
