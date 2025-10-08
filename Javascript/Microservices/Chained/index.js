const Chained = require('./Chained');

const pattern = new Chained({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
