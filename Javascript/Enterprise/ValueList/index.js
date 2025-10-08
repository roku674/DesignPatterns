const ValueList = require('./ValueList');

const pattern = new ValueList({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
