const ReactorPattern = require('./ReactorPattern');

const pattern = new ReactorPattern({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
