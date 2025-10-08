const SelfRegistration = require('./SelfRegistration');

const pattern = new SelfRegistration({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
