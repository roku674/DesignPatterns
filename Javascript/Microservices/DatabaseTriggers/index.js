const DatabaseTriggers = require('./DatabaseTriggers');

const pattern = new DatabaseTriggers({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
