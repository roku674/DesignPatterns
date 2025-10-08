const PipesAndFiltersCloud = require('./PipesAndFiltersCloud');

const pattern = new PipesAndFiltersCloud({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
