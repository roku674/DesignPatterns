const ReturnAddress = require('./ReturnAddress');

const pattern = new ReturnAddress({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
