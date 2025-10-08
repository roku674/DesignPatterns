const SupervisingController = require('./SupervisingController');

const pattern = new SupervisingController({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
