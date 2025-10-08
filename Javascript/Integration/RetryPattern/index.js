const RetryPattern = require('./RetryPattern');

const pattern = new RetryPattern({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
