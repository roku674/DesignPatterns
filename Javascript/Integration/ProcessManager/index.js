const ProcessManager = require('./ProcessManager');

const pattern = new ProcessManager({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
