const SeparatedInterface = require('./SeparatedInterface');

const pattern = new SeparatedInterface({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
