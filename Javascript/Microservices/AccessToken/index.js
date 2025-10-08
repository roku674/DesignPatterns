const AccessToken = require('./AccessToken');

const pattern = new AccessToken({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
