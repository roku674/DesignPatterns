const GatewayAggregation = require('./GatewayAggregation');

const pattern = new GatewayAggregation({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
