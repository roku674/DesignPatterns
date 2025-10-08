const CoarseGrainedLock = require('./CoarseGrainedLock');

const pattern = new CoarseGrainedLock({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
