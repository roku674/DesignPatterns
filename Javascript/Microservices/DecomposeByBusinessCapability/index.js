const DecomposeByBusinessCapability = require('./DecomposeByBusinessCapability');

const pattern = new DecomposeByBusinessCapability({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
