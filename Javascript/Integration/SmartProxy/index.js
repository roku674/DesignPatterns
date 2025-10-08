const SmartProxy = require('./SmartProxy');

const pattern = new SmartProxy({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
