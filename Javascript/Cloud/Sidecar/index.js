const Sidecar = require('./Sidecar');

const pattern = new Sidecar({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
