const CQRSMS = require('./CQRSMS');

const pattern = new CQRSMS({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
