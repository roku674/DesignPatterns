const InterceptingFilter = require('./InterceptingFilter');

const pattern = new InterceptingFilter({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
