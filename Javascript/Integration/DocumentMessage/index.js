const DocumentMessage = require('./DocumentMessage');

const pattern = new DocumentMessage({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
