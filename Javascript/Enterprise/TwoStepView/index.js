const TwoStepView = require('./TwoStepView');

const pattern = new TwoStepView({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
