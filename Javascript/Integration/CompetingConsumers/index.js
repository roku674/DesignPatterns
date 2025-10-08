const CompetingConsumers = require('./CompetingConsumers');

const pattern = new CompetingConsumers({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
