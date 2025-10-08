const ValetKey = require('./ValetKey');

const pattern = new ValetKey({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
