const { CSVProcessor, JSONProcessor } = require('./data-processor');

console.log('=== Template Method Pattern Demo ===\n');

console.log('Processing CSV file:');
const csvProcessor = new CSVProcessor();
csvProcessor.process();

console.log('\nProcessing JSON file:');
const jsonProcessor = new JSONProcessor();
jsonProcessor.process();

console.log('\n=== Demo Complete ===');
