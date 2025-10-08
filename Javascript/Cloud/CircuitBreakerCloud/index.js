const CircuitBreakerCloud = require('./CircuitBreakerCloud');

const pattern = new CircuitBreakerCloud({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
