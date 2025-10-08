const EventDrivenConsumer = require('./EventDrivenConsumer');

const pattern = new EventDrivenConsumer({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
