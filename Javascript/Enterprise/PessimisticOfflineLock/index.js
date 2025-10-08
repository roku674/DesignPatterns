const PessimisticOfflineLock = require('./PessimisticOfflineLock');

const pattern = new PessimisticOfflineLock({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
