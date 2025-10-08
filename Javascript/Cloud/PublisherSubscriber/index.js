const PublisherSubscriber = require('./PublisherSubscriber');

const pattern = new PublisherSubscriber({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
