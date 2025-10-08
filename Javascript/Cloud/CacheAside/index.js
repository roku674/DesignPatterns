const CacheAside = require('./CacheAside');

const pattern = new CacheAside({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
