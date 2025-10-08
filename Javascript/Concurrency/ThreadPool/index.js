const ThreadPool = require('./ThreadPool');

const pattern = new ThreadPool({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
