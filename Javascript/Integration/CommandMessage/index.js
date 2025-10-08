const CommandMessage = require('./CommandMessage');

const pattern = new CommandMessage({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
