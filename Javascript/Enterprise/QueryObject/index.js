const { UserQuery } = require('./QueryObject');

console.log('=== Query Object Pattern Demo ===\n');

console.log('1. Simple query');
const query1 = new UserQuery();
query1.byEmail('john@example.com');
console.log(`   SQL: SELECT * FROM users WHERE ${query1.build()}`);

console.log('\n2. Complex query');
const query2 = new UserQuery();
query2.byStatus('active').olderThan(18);
console.log(`   SQL: SELECT * FROM users WHERE ${query2.build()}`);

console.log('\n3. Chained query');
const query3 = new UserQuery()
  .byStatus('premium')
  .olderThan(21);
console.log(`   SQL: SELECT * FROM users WHERE ${query3.build()}`);

console.log('\n=== Benefits ===');
console.log('✓ Encapsulates query logic');
console.log('✓ Type-safe queries');
console.log('✓ Reusable query components');
