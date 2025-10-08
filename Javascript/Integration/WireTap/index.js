const WireTap = require('./WireTap');

const pattern = new WireTap({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
