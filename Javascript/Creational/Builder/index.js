/**
 * Builder Pattern - Production Demo
 * Demonstrates real HTTP request builder and SQL query builder
 */

const {
  HTTPRequestBuilder,
  SQLQueryBuilder,
  RequestDirector,
  QueryDirector
} = require('./pizza-builder');

async function main() {
  console.log('=== Builder Pattern - Production Implementation ===\n');

  // Example 1: Building HTTP Requests
  console.log('--- Example 1: Custom HTTP Request Building ---\n');

  const builder = new HTTPRequestBuilder();

  // Build a complex GET request
  const getRequest = builder
    .get('https://jsonplaceholder.typicode.com/posts')
    .setHeader('User-Agent', 'MyApp/1.0')
    .setHeader('Accept', 'application/json')
    .setQueryParam('userId', '1')
    .setQueryParam('_limit', '5')
    .setTimeout(5000)
    .setRetries(2)
    .build();

  console.log('GET Request Configuration:');
  console.log(getRequest.describe());

  try {
    const response = await getRequest.execute();
    console.log(`\nResponse Status: ${response.status}`);
    console.log(`Response Time: ${response.responseTime}ms`);
    console.log(`Data received: ${Array.isArray(response.data) ? response.data.length : 'N/A'} items\n`);
  } catch (error) {
    console.error('Request failed:', error.message);
  }

  // Example 2: POST Request with Authentication
  console.log('\n--- Example 2: Authenticated POST Request ---\n');

  const postRequest = builder
    .post('https://jsonplaceholder.typicode.com/posts')
    .setBearerToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
    .setBody({
      title: 'New Post',
      body: 'This is the content of the post',
      userId: 1
    })
    .setTimeout(10000)
    .setValidateStatus((status) => status >= 200 && status < 300)
    .build();

  console.log('POST Request Configuration:');
  console.log(postRequest.describe());

  try {
    const response = await postRequest.execute();
    console.log(`\nResponse Status: ${response.status}`);
    console.log(`Created item:`, response.data);
  } catch (error) {
    console.error('Request failed:', error.message);
  }

  // Example 3: Using Request Director
  console.log('\n\n--- Example 3: Using Request Director ---\n');

  const director = new RequestDirector(builder);

  // Create a standard JSON API request
  const apiRequest = director.buildJSONPostRequest(
    'https://jsonplaceholder.typicode.com/users',
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '555-1234'
    }
  );

  console.log('Director-built API Request:');
  console.log(apiRequest.describe());

  try {
    const response = await apiRequest.execute();
    console.log(`\nUser created with ID: ${response.data.id || 'N/A'}`);
  } catch (error) {
    console.error('Request failed:', error.message);
  }

  // Example 4: SQL Query Builder
  console.log('\n\n--- Example 4: SQL Query Building ---\n');

  const queryBuilder = new SQLQueryBuilder();

  // Build a complex SELECT query
  const selectQuery = queryBuilder
    .select('users.id', 'users.name', 'orders.order_date', 'orders.total')
    .from('users')
    .join('orders', 'users.id = orders.user_id')
    .where('users.active = ?', true)
    .and('orders.total > ?', 100)
    .orderBy('orders.order_date', 'DESC')
    .limit(10)
    .build();

  console.log('Complex SELECT Query:');
  console.log(selectQuery.toString());
  console.log('Parameters:', selectQuery.getParameters());

  // Build an INSERT query
  const insertQuery = queryBuilder
    .insert()
    .into('users')
    .values({
      name: 'Alice Smith',
      email: 'alice@example.com',
      age: 28,
      created_at: 'NOW()'
    })
    .build();

  console.log('\nINSERT Query:');
  console.log(insertQuery.toString());
  console.log('Parameters:', insertQuery.getParameters());

  // Build an UPDATE query
  const updateQuery = queryBuilder
    .update()
    .from('users')
    .set({
      last_login: 'NOW()',
      login_count: 'login_count + 1'
    })
    .where('id = ?', 123)
    .build();

  console.log('\nUPDATE Query:');
  console.log(updateQuery.toString());
  console.log('Parameters:', updateQuery.getParameters());

  // Build a DELETE query
  const deleteQuery = queryBuilder
    .delete()
    .from('sessions')
    .where('expires_at < ?', 'NOW()')
    .build();

  console.log('\nDELETE Query:');
  console.log(deleteQuery.toString());

  // Example 5: Using Query Director
  console.log('\n\n--- Example 5: Using Query Director ---\n');

  const queryDirector = new QueryDirector(queryBuilder);

  // Build a paginated query
  const paginatedQuery = queryDirector.buildPaginatedQuery('products', 2, 20);
  console.log('Paginated Query (Page 2, 20 per page):');
  console.log(paginatedQuery.toString());

  // Build a search query
  const searchQuery = queryDirector.buildSearchQuery('articles', 'title', 'javascript', 15);
  console.log('\nSearch Query:');
  console.log(searchQuery.toString());

  // Build a join query
  const joinQuery = queryDirector.buildJoinQuery(
    'customers',
    'orders',
    'customers.id = orders.customer_id',
    ['customers.name', 'customers.email', 'orders.total']
  );
  console.log('\nJoin Query:');
  console.log(joinQuery.toString());

  // Build an aggregate query
  const aggregateQuery = queryDirector.buildAggregateQuery('sales', 'category', 'product_id');
  console.log('\nAggregate Query:');
  console.log(aggregateQuery.toString());

  // Example 6: Builder Pattern Benefits
  console.log('\n\n--- Example 6: Pattern Benefits ---\n');

  console.log('Benefits of Builder Pattern:');
  console.log('  1. Complex Object Construction: Step-by-step construction of complex objects');
  console.log('  2. Fluent Interface: Readable, chainable method calls');
  console.log('  3. Immutability: Build once, use many times');
  console.log('  4. Validation: Validate each step during construction');
  console.log('  5. Reusability: Builder can be reused to create multiple objects');
  console.log('  6. Director Support: Predefined construction patterns via directors');

  // Example 7: Multiple Objects from Same Builder
  console.log('\n\n--- Example 7: Reusing Builder ---\n');

  console.log('Creating multiple requests with the same builder:\n');

  const requests = [];
  for (let i = 1; i <= 3; i++) {
    const req = builder
      .get(`https://jsonplaceholder.typicode.com/posts/${i}`)
      .setHeader('Accept', 'application/json')
      .setTimeout(5000)
      .build();

    requests.push(req);
    console.log(`Request ${i}: GET ${req.url}`);
  }

  console.log(`\nTotal requests built: ${requests.length}`);

  console.log('\n=== Demo Complete ===');
}

// Run the demo
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
