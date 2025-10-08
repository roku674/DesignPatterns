const Geodes = require('./Geodes');

const pattern = new Geodes({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
