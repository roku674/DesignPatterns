const DecomposeBySubdomain = require('./DecomposeBySubdomain');

const pattern = new DecomposeBySubdomain({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
