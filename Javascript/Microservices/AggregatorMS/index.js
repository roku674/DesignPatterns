const AggregatorMS = require('./AggregatorMS');

const pattern = new AggregatorMS({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
