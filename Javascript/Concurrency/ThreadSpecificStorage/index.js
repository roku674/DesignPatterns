const ThreadSpecificStorage = require('./ThreadSpecificStorage');

const pattern = new ThreadSpecificStorage({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
