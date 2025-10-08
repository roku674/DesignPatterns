const RoutingSlip = require('./RoutingSlip');

const pattern = new RoutingSlip({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
