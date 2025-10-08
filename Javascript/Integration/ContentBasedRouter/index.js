const ContentBasedRouter = require('./ContentBasedRouter');

const pattern = new ContentBasedRouter({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
