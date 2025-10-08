const Gatekeeper = require('./Gatekeeper');

const pattern = new Gatekeeper({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
