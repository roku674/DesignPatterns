const MessageFilter = require('./MessageFilter');

const pattern = new MessageFilter({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
