const MessageChannel = require('./MessageChannel');

const pattern = new MessageChannel({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
