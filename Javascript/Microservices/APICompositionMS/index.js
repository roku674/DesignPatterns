const APICompositionMS = require('./APICompositionMS');

const pattern = new APICompositionMS({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
