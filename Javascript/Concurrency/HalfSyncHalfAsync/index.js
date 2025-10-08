const HalfSyncHalfAsync = require('./HalfSyncHalfAsync');

const pattern = new HalfSyncHalfAsync({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
