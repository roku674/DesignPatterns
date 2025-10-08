const ServiceActivator = require('./ServiceActivator');

const pattern = new ServiceActivator({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
