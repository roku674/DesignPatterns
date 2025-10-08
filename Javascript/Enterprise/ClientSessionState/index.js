const ClientSessionState = require('./ClientSessionState');

const pattern = new ClientSessionState({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
