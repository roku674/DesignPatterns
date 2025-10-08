const MessagingAdapter = require('./MessagingAdapter');

const pattern = new MessagingAdapter({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
