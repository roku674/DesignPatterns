const Detour = require('./Detour');

const pattern = new Detour({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
