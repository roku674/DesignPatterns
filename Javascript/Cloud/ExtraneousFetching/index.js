const ExtraneousFetching = require('./ExtraneousFetching');

const pattern = new ExtraneousFetching({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
