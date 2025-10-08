const ServerSideDiscovery = require('./ServerSideDiscovery');

const pattern = new ServerSideDiscovery({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
