const CompositeSpecification = require('./CompositeSpecification');

const pattern = new CompositeSpecification({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
