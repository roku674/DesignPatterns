const LayerSupertype = require('./LayerSupertype');

const pattern = new LayerSupertype({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
