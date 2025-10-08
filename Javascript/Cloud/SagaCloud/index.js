const SagaCloud = require('./SagaCloud');

const pattern = new SagaCloud({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
