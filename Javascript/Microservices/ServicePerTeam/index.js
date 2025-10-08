const ServicePerTeam = require('./ServicePerTeam');

const pattern = new ServicePerTeam({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
