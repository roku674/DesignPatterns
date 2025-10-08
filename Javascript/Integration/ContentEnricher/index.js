const ContentEnricher = require('./ContentEnricher');

const pattern = new ContentEnricher({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
