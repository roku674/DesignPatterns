const CircuitBreaker = require('./CircuitBreaker');

const pattern = new CircuitBreaker({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
