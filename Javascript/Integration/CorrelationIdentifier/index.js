const CorrelationIdentifier = require('./CorrelationIdentifier');

const pattern = new CorrelationIdentifier({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
