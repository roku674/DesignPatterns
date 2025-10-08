const SequentialConvoy = require('./SequentialConvoy');

const pattern = new SequentialConvoy({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
