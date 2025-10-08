const AsyncMessaging = require('./AsyncMessaging');

const pattern = new AsyncMessaging({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
