const BusyFrontEnd = require('./BusyFrontEnd');

const pattern = new BusyFrontEnd({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
