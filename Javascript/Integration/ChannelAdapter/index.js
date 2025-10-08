const ChannelAdapter = require('./ChannelAdapter');

const pattern = new ChannelAdapter({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
