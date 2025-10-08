const AcceptorConnector = require('./AcceptorConnector');

const pattern = new AcceptorConnector({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
