const ExternalConfigurationStore = require('./ExternalConfigurationStore');

const pattern = new ExternalConfigurationStore({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
