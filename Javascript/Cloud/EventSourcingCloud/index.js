const EventSourcingCloud = require('./EventSourcingCloud');

const pattern = new EventSourcingCloud({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
