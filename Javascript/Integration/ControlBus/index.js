const ControlBus = require('./ControlBus');

const pattern = new ControlBus({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
