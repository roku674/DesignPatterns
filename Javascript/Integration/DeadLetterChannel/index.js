const DeadLetterChannel = require('./DeadLetterChannel');

const pattern = new DeadLetterChannel({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
