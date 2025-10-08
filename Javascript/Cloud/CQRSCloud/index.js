const CQRSCloud = require('./CQRSCloud');

const pattern = new CQRSCloud({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
