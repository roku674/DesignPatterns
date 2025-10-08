const Promise = require('./Promise');

const pattern = new Promise({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
