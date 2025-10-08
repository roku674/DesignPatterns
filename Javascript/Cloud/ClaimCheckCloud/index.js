const ClaimCheckCloud = require('./ClaimCheckCloud');

const pattern = new ClaimCheckCloud({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
