const PageController = require('./PageController');

const pattern = new PageController({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
