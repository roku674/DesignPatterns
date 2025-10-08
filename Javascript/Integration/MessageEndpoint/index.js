const MessageEndpoint = require('./MessageEndpoint');

const pattern = new MessageEndpoint({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
