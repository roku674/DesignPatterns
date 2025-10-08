const CircuitBreakerMS = require('./CircuitBreakerMS');

const pattern = new CircuitBreakerMS({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
