const NoCaching = require('./NoCaching');

const pattern = new NoCaching({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
