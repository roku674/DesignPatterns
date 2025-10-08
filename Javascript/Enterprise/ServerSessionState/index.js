const ServerSessionState = require('./ServerSessionState');

const pattern = new ServerSessionState({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
