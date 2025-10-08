const DatabaseperService = require('./DatabaseperService');

const pattern = new DatabaseperService({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
