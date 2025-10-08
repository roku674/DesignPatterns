const Scheduler = require('./Scheduler');

const pattern = new Scheduler({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
