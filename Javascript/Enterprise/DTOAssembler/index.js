const DTOAssembler = require('./DTOAssembler');

const pattern = new DTOAssembler({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
