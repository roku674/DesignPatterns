const GuardedSuspension = require('./GuardedSuspension');

const pattern = new GuardedSuspension({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
