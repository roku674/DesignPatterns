const LeaderElection = require('./LeaderElection');

const pattern = new LeaderElection({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
