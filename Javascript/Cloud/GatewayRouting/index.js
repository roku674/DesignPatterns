const GatewayRouting = require('./GatewayRouting');

const pattern = new GatewayRouting({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
