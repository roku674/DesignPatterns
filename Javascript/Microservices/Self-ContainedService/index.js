const Self-ContainedService = require('./Self-ContainedService');

const pattern = new Self-ContainedService({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
