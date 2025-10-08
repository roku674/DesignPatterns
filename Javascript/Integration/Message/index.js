const Message = require('./Message');

const pattern = new Message({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
