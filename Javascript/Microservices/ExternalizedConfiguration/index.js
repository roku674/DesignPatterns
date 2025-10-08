const ExternalizedConfiguration = require('./ExternalizedConfiguration');

const pattern = new ExternalizedConfiguration({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
