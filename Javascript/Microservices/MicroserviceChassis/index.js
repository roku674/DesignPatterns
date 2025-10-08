const MicroserviceChassis = require('./MicroserviceChassis');

const pattern = new MicroserviceChassis({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
