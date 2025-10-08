const WrapperFacade = require('./WrapperFacade');

const pattern = new WrapperFacade({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
