const PriorityQueue = require('./PriorityQueue');

const pattern = new PriorityQueue({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
