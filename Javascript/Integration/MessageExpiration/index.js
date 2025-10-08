const MessageExpiration = require('./MessageExpiration');

const pattern = new MessageExpiration({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
