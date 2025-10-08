const RetryPatternCloud = require('./RetryPatternCloud');

const pattern = new RetryPatternCloud({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
