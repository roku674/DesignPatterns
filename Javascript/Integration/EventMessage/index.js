const EventMessage = require('./EventMessage');

const pattern = new EventMessage({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
