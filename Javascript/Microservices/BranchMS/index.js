const BranchMS = require('./BranchMS');

const pattern = new BranchMS({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
