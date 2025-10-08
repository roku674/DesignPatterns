const TestMessage = require('./TestMessage');

const pattern = new TestMessage({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
