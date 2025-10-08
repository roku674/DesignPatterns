const StranglerMS = require('./StranglerMS');

const pattern = new StranglerMS({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
