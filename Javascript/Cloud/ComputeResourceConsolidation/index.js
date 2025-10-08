const ComputeResourceConsolidation = require('./ComputeResourceConsolidation');

const pattern = new ComputeResourceConsolidation({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
