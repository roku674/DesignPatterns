const ChannelPurger = require('./ChannelPurger');

const pattern = new ChannelPurger({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
