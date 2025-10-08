const SelfContainedService = require('./SelfContainedService');

const pattern = new SelfContainedService({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
