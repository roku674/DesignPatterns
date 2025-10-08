const ModelViewController = require('./ModelViewController');

const pattern = new ModelViewController({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
