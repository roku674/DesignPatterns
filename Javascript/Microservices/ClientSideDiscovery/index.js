const ClientSideDiscovery = require('./ClientSideDiscovery');

const pattern = new ClientSideDiscovery({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
