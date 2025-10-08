const Choreography = require('./Choreography');

const pattern = new Choreography({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
