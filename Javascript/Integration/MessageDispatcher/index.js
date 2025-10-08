const MessageDispatcher = require('./MessageDispatcher');

const pattern = new MessageDispatcher({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
