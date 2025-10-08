const MonitorObject = require('./MonitorObject');

const pattern = new MonitorObject({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
