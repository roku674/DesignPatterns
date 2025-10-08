const Orchestration = require('./Orchestration');

const pattern = new Orchestration({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
