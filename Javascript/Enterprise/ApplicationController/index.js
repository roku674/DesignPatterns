const ApplicationController = require('./ApplicationController');

const pattern = new ApplicationController({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
