const TemplateView = require('./TemplateView');

const pattern = new TemplateView({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
