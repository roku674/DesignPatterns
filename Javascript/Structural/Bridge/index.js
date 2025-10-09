/**
 * Bridge Pattern - Real Production Usage Example
 */

const {
  MemoryStorage,
  FileStorage,
  CompressedStorage,
  SimpleRepository,
  CachedRepository,
  ValidatedRepository
} = require('./messaging-bridge');

async function demonstrateRealBridge() {
  console.log('=== REAL Bridge Pattern - Data Storage ===\n');

  // Example 1: Simple repository with different storage backends
  console.log('1. Simple Repository with Different Storage Backends:\n');

  const memoryRepo = new SimpleRepository(new MemoryStorage());
  const fileRepo = new SimpleRepository(new FileStorage('./temp-storage'));

  // Save data to memory
  console.log('--- Memory Storage ---');
  await memoryRepo.create('user:1', { name: 'Alice', age: 30 });
  const memResult = await memoryRepo.read('user:1');
  console.log('Read from memory:', memResult.value);

  // Save data to file
  console.log('\n--- File Storage ---');
  await fileRepo.create('user:2', { name: 'Bob', age: 25 });
  const fileResult = await fileRepo.read('user:2');
  console.log('Read from file:', fileResult.value);

  // Example 2: Cached repository for performance
  console.log('\n\n2. Cached Repository with Performance Tracking:\n');

  const cachedRepo = new CachedRepository(new MemoryStorage());

  await cachedRepo.create('product:1', { name: 'Laptop', price: 999 });

  // First read - cache miss
  await cachedRepo.read('product:1');
  console.log('Cache stats after first read:', cachedRepo.getCacheStats());

  // Second read - cache hit
  await cachedRepo.read('product:1');
  console.log('Cache stats after second read:', cachedRepo.getCacheStats());

  // Third read - cache hit
  await cachedRepo.read('product:1');
  console.log('Cache stats after third read:', cachedRepo.getCacheStats());

  // Example 3: Validated repository
  console.log('\n\n3. Validated Repository with Schema:\n');

  const userSchema = {
    type: 'object',
    required: ['name', 'email', 'age'],
    validator: (value) => {
      if (value.age < 18) return 'Age must be 18 or older';
      if (!value.email.includes('@')) return 'Invalid email format';
      return true;
    }
  };

  const validatedRepo = new ValidatedRepository(new MemoryStorage(), userSchema);

  // Valid user
  try {
    await validatedRepo.create('user:3', {
      name: 'Charlie',
      email: 'charlie@example.com',
      age: 22
    });
    console.log('Valid user created successfully');
  } catch (error) {
    console.log('Error:', error.message);
  }

  // Invalid user (missing email)
  try {
    await validatedRepo.create('user:4', {
      name: 'David',
      age: 20
    });
  } catch (error) {
    console.log('Validation error (missing email):', error.message);
  }

  // Invalid user (age too young)
  try {
    await validatedRepo.create('user:5', {
      name: 'Eve',
      email: 'eve@example.com',
      age: 16
    });
  } catch (error) {
    console.log('Validation error (age < 18):', error.message);
  }

  // Example 4: Switching storage implementations at runtime
  console.log('\n\n4. Switching Storage Implementations at Runtime:\n');

  const flexibleRepo = new SimpleRepository(new MemoryStorage());

  await flexibleRepo.create('config:1', { theme: 'dark' });
  console.log('Saved to memory storage');

  // Switch to file storage
  flexibleRepo.setStorage(new FileStorage('./temp-storage'));
  await flexibleRepo.create('config:2', { theme: 'light' });
  console.log('Saved to file storage');

  // List all keys in file storage
  const list = await flexibleRepo.list();
  console.log('Keys in file storage:', list.keys);

  // Example 5: Compressed storage
  console.log('\n\n5. Compressed Storage Layer:\n');

  const baseStorage = new MemoryStorage();
  const compressedStorage = new CompressedStorage(baseStorage);
  const compressedRepo = new SimpleRepository(compressedStorage);

  const largeObject = {
    id: 1,
    data: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10),
    items: Array.from({ length: 100 }, (_, i) => ({ id: i, value: `Item ${i}` }))
  };

  await compressedRepo.create('large:1', largeObject);
  console.log('Large object saved with compression');

  const retrieved = await compressedRepo.read('large:1');
  console.log('Retrieved compressed object, item count:', retrieved.value.items.length);

  // Cleanup
  console.log('\n\n6. Cleanup:\n');
  await memoryRepo.clear();
  await fileRepo.clear();
  console.log('All repositories cleared');

  console.log('\n=== Demo Complete ===');
  console.log('\nKey Benefits Demonstrated:');
  console.log('- Abstraction (Repository) separated from Implementation (Storage)');
  console.log('- Can combine any abstraction with any implementation');
  console.log('- Easy to add new storage backends without changing repositories');
  console.log('- Easy to add new repository types without changing storage');
  console.log('- Caching, validation, and compression work with any storage');
  console.log('- Real file system operations and memory management');
}

// Run the demonstration
if (require.main === module) {
  demonstrateRealBridge().catch(console.error);
}

module.exports = { demonstrateRealBridge };
