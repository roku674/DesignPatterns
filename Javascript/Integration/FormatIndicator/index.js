const FormatIndicator = require('./FormatIndicator');

const pattern = new FormatIndicator({ example: 'configuration' });
const result = pattern.execute();
console.log('Result:', result);
