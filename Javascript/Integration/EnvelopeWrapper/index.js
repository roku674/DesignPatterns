const EnvelopeWrapper = require('./EnvelopeWrapper');

const pattern = new EnvelopeWrapper({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
