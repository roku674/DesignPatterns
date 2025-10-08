const ChattyIO = require('./ChattyIO');

const pattern = new ChattyIO({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
