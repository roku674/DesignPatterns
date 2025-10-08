const ScatterGather = require('./ScatterGather');

const pattern = new ScatterGather({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
