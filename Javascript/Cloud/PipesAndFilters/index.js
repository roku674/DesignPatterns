const PipesAndFilters = require('./PipesAndFilters');

const pattern = new PipesAndFilters({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
