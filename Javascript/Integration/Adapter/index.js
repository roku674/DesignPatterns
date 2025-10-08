const Adapter = require('./Adapter');

const pattern = new Adapter({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
