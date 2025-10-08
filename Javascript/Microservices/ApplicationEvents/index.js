const ApplicationEvents = require('./ApplicationEvents');

const pattern = new ApplicationEvents({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
