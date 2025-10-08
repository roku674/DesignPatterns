const IndexTable = require('./IndexTable');

const pattern = new IndexTable({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
