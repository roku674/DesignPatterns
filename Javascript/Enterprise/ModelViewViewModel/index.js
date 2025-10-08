const ModelViewViewModel = require('./ModelViewViewModel');

const pattern = new ModelViewViewModel({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
