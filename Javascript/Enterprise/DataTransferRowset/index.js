const DataTransferRowset = require('./DataTransferRowset');

const pattern = new DataTransferRowset({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
