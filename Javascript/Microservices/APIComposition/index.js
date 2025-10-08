const APIComposition = require('./APIComposition');

const pattern = new APIComposition({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
