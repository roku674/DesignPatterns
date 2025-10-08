const ServiceperTeam = require('./ServiceperTeam');

const pattern = new ServiceperTeam({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
