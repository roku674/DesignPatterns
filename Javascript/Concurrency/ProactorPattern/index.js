const ProactorPattern = require('./ProactorPattern');

const pattern = new ProactorPattern({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
