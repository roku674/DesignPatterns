const SelectiveConsumer = require('./SelectiveConsumer');

const pattern = new SelectiveConsumer({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
