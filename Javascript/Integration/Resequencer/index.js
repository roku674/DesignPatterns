const Resequencer = require('./Resequencer');

const pattern = new Resequencer({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
