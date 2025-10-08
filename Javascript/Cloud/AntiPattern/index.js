const AntiPattern = require('./AntiPattern');

const pattern = new AntiPattern({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
