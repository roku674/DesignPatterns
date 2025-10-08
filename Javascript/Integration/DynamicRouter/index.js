const DynamicRouter = require('./DynamicRouter');

const pattern = new DynamicRouter({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
