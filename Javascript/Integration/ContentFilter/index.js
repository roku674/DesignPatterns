const ContentFilter = require('./ContentFilter');

const pattern = new ContentFilter({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
