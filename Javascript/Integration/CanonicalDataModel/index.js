const CanonicalDataModel = require('./CanonicalDataModel');

const pattern = new CanonicalDataModel({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
