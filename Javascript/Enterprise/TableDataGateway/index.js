const { PersonGateway } = require('./TableDataGateway');

console.log('=== Table Data Gateway Pattern Demo ===\n');

const gateway = new PersonGateway();

console.log('1. Finding all persons');
const all = gateway.findAll();
console.log(`   Found ${all.length} persons`);

console.log('\n2. Finding person by ID');
const person = gateway.findById(1);
console.log(`   Found: ${person.firstName} ${person.lastName}`);

console.log('\n3. Inserting new person');
const newPerson = gateway.insert('Bob', 'Wilson', 'bob@example.com');
console.log(`   Inserted: ${newPerson.firstName} with ID ${newPerson.id}`);

console.log('\n4. Updating person');
gateway.update(1, 'John', 'Doe Jr', 'johnjr@example.com');

console.log('\n5. Deleting person');
gateway.delete(2);

console.log('\n=== Benefits ===');
console.log('✓ One gateway per table');
console.log('✓ Encapsulates SQL');
console.log('✓ Centralized data access');
