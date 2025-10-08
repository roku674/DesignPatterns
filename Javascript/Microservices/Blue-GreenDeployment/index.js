const Blue-GreenDeployment = require('./Blue-GreenDeployment');

const pattern = new Blue-GreenDeployment({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
