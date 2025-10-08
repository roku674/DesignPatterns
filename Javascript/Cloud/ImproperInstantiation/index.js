const ImproperInstantiation = require('./ImproperInstantiation');

const pattern = new ImproperInstantiation({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
