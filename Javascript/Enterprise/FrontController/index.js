const FrontController = require('./FrontController');

const pattern = new FrontController({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
