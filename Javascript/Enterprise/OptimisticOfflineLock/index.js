const OptimisticOfflineLock = require('./OptimisticOfflineLock');

const pattern = new OptimisticOfflineLock({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
