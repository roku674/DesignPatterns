const { PersonGateway } = require('./RowDataGateway');

console.log('=== Row Data Gateway Pattern Demo ===\n');

console.log('1. Creating new person');
const person = new PersonGateway(1, 'Jane', 'Smith', 'jane@example.com');
person.insert();

console.log('\n2. Finding person');
const found = PersonGateway.find(1);
console.log(`   Found: ${found.getFullName()}`);

console.log('\n3. Updating person');
found.email = 'jane.smith@example.com';
found.update();

console.log('\n4. Deleting person');
found.delete();

console.log('\n=== Benefits ===');
console.log('✓ One gateway instance per row');
console.log('✓ Encapsulates database access');
console.log('✓ Simple CRUD operations');
