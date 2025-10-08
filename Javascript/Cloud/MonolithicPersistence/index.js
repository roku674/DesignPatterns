const MonolithicPersistence = require('./MonolithicPersistence');

const pattern = new MonolithicPersistence({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
