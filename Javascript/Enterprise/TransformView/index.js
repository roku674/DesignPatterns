const TransformView = require('./TransformView');

const pattern = new TransformView({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
