const StranglerFig = require('./StranglerFig');

const pattern = new StranglerFig({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
