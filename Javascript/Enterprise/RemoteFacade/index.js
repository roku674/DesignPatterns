const RemoteFacade = require('./RemoteFacade');

const pattern = new RemoteFacade({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
