const ThirdPartyRegistration = require('./ThirdPartyRegistration');

const pattern = new ThirdPartyRegistration({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
