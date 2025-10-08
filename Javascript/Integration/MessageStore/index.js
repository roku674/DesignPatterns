const MessageStore = require('./MessageStore');

const pattern = new MessageStore({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
