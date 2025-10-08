const ActiveObject = require('./ActiveObject');

const pattern = new ActiveObject({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
