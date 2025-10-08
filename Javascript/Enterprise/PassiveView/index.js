const PassiveView = require('./PassiveView');

const pattern = new PassiveView({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
