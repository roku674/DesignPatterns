const EventSourcingMS = require('./EventSourcingMS');

const pattern = new EventSourcingMS({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
