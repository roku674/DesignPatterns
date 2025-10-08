const SagaMS = require('./SagaMS');

const pattern = new SagaMS({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
