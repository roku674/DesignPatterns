const MessageSequence = require('./MessageSequence');

const pattern = new MessageSequence({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
