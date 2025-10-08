const BackendsForFrontends = require('./BackendsForFrontends');

const pattern = new BackendsForFrontends({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
