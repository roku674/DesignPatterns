const Strangler = require('./Strangler');

const pattern = new Strangler({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
