const HealthEndpointMonitoring = require('./HealthEndpointMonitoring');

const pattern = new HealthEndpointMonitoring({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
