const CircuitBreakerPattern = require('./CircuitBreakerPattern');

const pattern = new CircuitBreakerPattern({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
