const ServiceTemplate = require('./ServiceTemplate');

const pattern = new ServiceTemplate({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
