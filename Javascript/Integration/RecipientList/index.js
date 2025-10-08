const RecipientList = require('./RecipientList');

const pattern = new RecipientList({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
