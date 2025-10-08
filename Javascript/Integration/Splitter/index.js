const Splitter = require('./Splitter');

const pattern = new Splitter({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
