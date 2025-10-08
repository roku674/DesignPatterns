const Registry = require('./Registry');

const pattern = new Registry({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
