const ComposedMessageProcessor = require('./ComposedMessageProcessor');

const pattern = new ComposedMessageProcessor({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
