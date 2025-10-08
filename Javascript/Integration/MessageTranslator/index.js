const MessageTranslator = require('./MessageTranslator');

const pattern = new MessageTranslator({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
