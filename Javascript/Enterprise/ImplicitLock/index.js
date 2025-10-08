const ImplicitLock = require('./ImplicitLock');

const pattern = new ImplicitLock({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
