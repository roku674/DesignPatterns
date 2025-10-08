const Ambassador = require('./Ambassador');

const pattern = new Ambassador({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
