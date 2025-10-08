const APIGateway = require('./APIGateway');

const pattern = new APIGateway({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
