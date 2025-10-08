const Balking = require('./Balking');

const pattern = new Balking({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
