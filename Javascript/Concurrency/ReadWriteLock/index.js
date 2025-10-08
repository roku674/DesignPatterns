const ReadWriteLock = require('./ReadWriteLock');

const pattern = new ReadWriteLock({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
