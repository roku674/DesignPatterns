const EventSourcing = require('./EventSourcing');

const pattern = new EventSourcing({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
