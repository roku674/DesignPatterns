const Mapper = require('./Mapper');

const pattern = new Mapper({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
