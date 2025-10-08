const MessagingMapper = require('./MessagingMapper');

const pattern = new MessagingMapper({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
