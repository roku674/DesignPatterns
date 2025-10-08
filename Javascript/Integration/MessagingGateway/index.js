const MessagingGateway = require('./MessagingGateway');

const pattern = new MessagingGateway({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
