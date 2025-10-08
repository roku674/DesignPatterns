const ModelViewPresenter = require('./ModelViewPresenter');

const pattern = new ModelViewPresenter({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
