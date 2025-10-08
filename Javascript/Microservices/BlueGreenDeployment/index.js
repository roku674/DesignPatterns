const BlueGreenDeployment = require('./BlueGreenDeployment');

const pattern = new BlueGreenDeployment({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
