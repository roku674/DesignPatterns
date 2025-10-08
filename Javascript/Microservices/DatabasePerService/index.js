const DatabasePerService = require('./DatabasePerService');

const pattern = new DatabasePerService({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
