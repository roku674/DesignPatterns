/**
 * CQRS Pattern Demonstration
 *
 * Command Query Responsibility Segregation (CQRS) separates read and write operations
 * into different models to optimize performance, scalability, and security.
 */

const { CommandService, QueryService, EventStore } = require('./CQRS');

console.log('=== CQRS Pattern Demo ===\n');

// Initialize services
const eventStore = new EventStore();
const commandService = new CommandService(eventStore);
const queryService = new QueryService(eventStore);

console.log('1. Creating a new user (Command)');
commandService.createUser('user-1', 'John Doe', 'john@example.com');
console.log('   ✓ User created');

console.log('\n2. Updating user email (Command)');
commandService.updateUserEmail('user-1', 'john.doe@example.com');
console.log('   ✓ Email updated');

console.log('\n3. Querying user (Query)');
const user = queryService.getUserById('user-1');
console.log('   User:', user);

console.log('\n4. Getting all users (Query)');
const allUsers = queryService.getAllUsers();
console.log('   Total users:', allUsers.length);

console.log('\n5. Creating multiple users');
commandService.createUser('user-2', 'Jane Smith', 'jane@example.com');
commandService.createUser('user-3', 'Bob Wilson', 'bob@example.com');
console.log('   ✓ Users created');

console.log('\n6. Querying all users again');
const updatedUsers = queryService.getAllUsers();
console.log('   Total users:', updatedUsers.length);
updatedUsers.forEach(u => console.log(`   - ${u.name} (${u.email})`));

console.log('\n7. Searching users by email domain');
const searchResults = queryService.searchUsersByEmail('example.com');
console.log(`   Found ${searchResults.length} users with @example.com`);

console.log('\n8. Viewing event history');
const events = eventStore.getEvents();
console.log(`   Total events: ${events.length}`);
events.forEach(event => {
  console.log(`   - ${event.type}: ${event.aggregateId} at ${new Date(event.timestamp).toISOString()}`);
});

console.log('\n=== Benefits of CQRS ===');
console.log('✓ Separate optimization of reads and writes');
console.log('✓ Independent scaling of query and command services');
console.log('✓ Better security through separation of concerns');
console.log('✓ Simplified complex business logic');
console.log('✓ Event sourcing capability');
