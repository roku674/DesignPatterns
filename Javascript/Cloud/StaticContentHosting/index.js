const StaticContentHosting = require('./StaticContentHosting');

const pattern = new StaticContentHosting({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
