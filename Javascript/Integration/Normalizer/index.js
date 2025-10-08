const Normalizer = require('./Normalizer');

const pattern = new Normalizer({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
