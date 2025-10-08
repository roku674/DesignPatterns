const GatewayOffloading = require('./GatewayOffloading');

const pattern = new GatewayOffloading({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
