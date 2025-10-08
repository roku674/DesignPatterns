const ServiceDiscovery = require('./ServiceDiscovery');

const pattern = new ServiceDiscovery({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
