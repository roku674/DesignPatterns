const LeaderFollowers = require('./LeaderFollowers');

const pattern = new LeaderFollowers({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
