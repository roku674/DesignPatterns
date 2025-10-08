const Anti-CorruptionLayer = require('./Anti-CorruptionLayer');

const pattern = new Anti-CorruptionLayer({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
