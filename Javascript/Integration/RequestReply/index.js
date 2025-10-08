const RequestReply = require('./RequestReply');

const pattern = new RequestReply({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
