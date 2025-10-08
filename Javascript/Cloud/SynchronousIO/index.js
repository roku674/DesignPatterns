const SynchronousIO = require('./SynchronousIO');

const pattern = new SynchronousIO({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
