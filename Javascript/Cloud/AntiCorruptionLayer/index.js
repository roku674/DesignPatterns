const AntiCorruptionLayer = require('./AntiCorruptionLayer');

const pattern = new AntiCorruptionLayer({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
