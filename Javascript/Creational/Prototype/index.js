/**
 * Prototype Pattern - Production Demo
 * Demonstrates real object cloning with deep copy for complex data structures
 */

const {
  UserProfile,
  ApplicationState,
  Configuration,
  APIRequest,
  PrototypeRegistry,
  StateManager,
  ObjectPool,
  deepClone
} = require('./document-prototype');

function main() {
  console.log('=== Prototype Pattern - Production Implementation ===\n');

  // Example 1: Cloning User Profiles
  console.log('--- Example 1: User Profile Cloning ---\n');

  const originalProfile = new UserProfile({
    id: 1001,
    username: 'john_doe',
    email: 'john@example.com',
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      avatar: 'https://example.com/avatar.jpg',
      bio: 'Software Developer',
      socialLinks: ['https://github.com/johndoe', 'https://twitter.com/johndoe']
    },
    tags: ['developer', 'javascript', 'nodejs'],
    permissions: new Set(['read', 'write', 'delete'])
  });

  console.log('Original Profile:');
  console.log(JSON.stringify(originalProfile.toJSON(), null, 2));

  // Clone the profile
  const clonedProfile = originalProfile.clone();
  clonedProfile.id = 1002;
  clonedProfile.username = 'jane_doe';
  clonedProfile.email = 'jane@example.com';
  clonedProfile.profile.firstName = 'Jane';
  clonedProfile.profile.socialLinks.push('https://linkedin.com/in/janedoe');
  clonedProfile.tags.push('react');
  clonedProfile.permissions.add('admin');

  console.log('\nCloned Profile (modified):');
  console.log(JSON.stringify(clonedProfile.toJSON(), null, 2));

  console.log('\nOriginal profile unchanged:');
  console.log(`Username: ${originalProfile.username}`);
  console.log(`Social Links: ${originalProfile.profile.socialLinks.length}`);
  console.log(`Tags: ${originalProfile.tags.length}`);
  console.log(`Permissions: ${Array.from(originalProfile.permissions).join(', ')}`);

  // Example 2: Application State Management
  console.log('\n\n--- Example 2: Application State Snapshots ---\n');

  const appState = new ApplicationState({
    route: '/dashboard',
    user: { id: 1, name: 'John' },
    ui: {
      sidebar: { open: true, width: 250 },
      modals: ['settings'],
      notifications: [
        { id: 1, message: 'Welcome!', read: false }
      ],
      theme: 'dark'
    }
  });

  appState.data.cache.set('users', [{ id: 1, name: 'John' }]);
  appState.data.loading.add('posts');

  console.log('Initial State:');
  console.log(`Route: ${appState.route}`);
  console.log(`Sidebar open: ${appState.ui.sidebar.open}`);
  console.log(`Modals: ${appState.ui.modals.join(', ')}`);
  console.log(`Cache entries: ${appState.data.cache.size}`);

  // Create a snapshot
  const snapshot = appState.save();

  // Modify state
  appState.route = '/profile';
  appState.ui.sidebar.open = false;
  appState.ui.modals = [];
  appState.data.cache.clear();

  console.log('\nModified State:');
  console.log(`Route: ${appState.route}`);
  console.log(`Sidebar open: ${appState.ui.sidebar.open}`);
  console.log(`Modals: ${appState.ui.modals.length}`);
  console.log(`Cache entries: ${appState.data.cache.size}`);

  // Restore from snapshot
  appState.restore(snapshot);

  console.log('\nRestored State:');
  console.log(`Route: ${appState.route}`);
  console.log(`Sidebar open: ${appState.ui.sidebar.open}`);
  console.log(`Modals: ${appState.ui.modals.join(', ')}`);
  console.log(`Cache entries: ${appState.data.cache.size}`);

  // Example 3: Configuration Cloning
  console.log('\n\n--- Example 3: Environment-Specific Configuration ---\n');

  const baseConfig = new Configuration({
    environment: 'development',
    server: {
      host: 'localhost',
      port: 3000,
      ssl: false
    },
    database: {
      host: 'localhost',
      port: 5432,
      name: 'myapp_dev'
    }
  });

  baseConfig.features.set('analytics', false);
  baseConfig.features.set('beta_features', true);

  console.log('Base Configuration (Development):');
  console.log(`Environment: ${baseConfig.environment}`);
  console.log(`Server: ${baseConfig.server.host}:${baseConfig.server.port} (SSL: ${baseConfig.server.ssl})`);
  console.log(`Database Pool: ${baseConfig.database.pool.min}-${baseConfig.database.pool.max}`);

  // Clone for production
  const prodConfig = baseConfig.cloneForEnvironment('production');
  prodConfig.server.host = 'api.myapp.com';
  prodConfig.database.host = 'db.myapp.com';
  prodConfig.database.name = 'myapp_prod';
  prodConfig.features.set('analytics', true);
  prodConfig.features.set('beta_features', false);

  console.log('\nProduction Configuration:');
  console.log(`Environment: ${prodConfig.environment}`);
  console.log(`Server: ${prodConfig.server.host}:${prodConfig.server.port} (SSL: ${prodConfig.server.ssl})`);
  console.log(`Database Pool: ${prodConfig.database.pool.min}-${prodConfig.database.pool.max}`);
  console.log(`Analytics: ${prodConfig.features.get('analytics')}`);

  console.log('\nBase config unchanged:');
  console.log(`Environment: ${baseConfig.environment}`);
  console.log(`SSL: ${baseConfig.server.ssl}`);

  // Example 4: API Request Templates
  console.log('\n\n--- Example 4: API Request Templates ---\n');

  const baseRequest = new APIRequest({
    method: 'GET',
    url: 'https://api.example.com/users',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer token123'
    },
    timeout: 5000,
    retries: 2
  });

  console.log('Base Request Template:');
  console.log(`${baseRequest.method} ${baseRequest.url}`);

  // Clone with different parameters
  const userRequest = baseRequest.cloneWithParams({ id: 123, include: 'profile' });
  console.log('\nCloned Request with Params:');
  console.log(`${userRequest.method} ${userRequest.url}`);
  console.log(`Params:`, userRequest.params);

  // Clone with body (for POST/PUT)
  const postRequest = baseRequest.clone();
  postRequest.method = 'POST';
  postRequest.url = 'https://api.example.com/users';
  postRequest.body = {
    name: 'New User',
    email: 'newuser@example.com'
  };

  console.log('\nPOST Request:');
  console.log(`${postRequest.method} ${postRequest.url}`);
  console.log('Body:', postRequest.body);

  // Example 5: Prototype Registry
  console.log('\n\n--- Example 5: Prototype Registry ---\n');

  const registry = new PrototypeRegistry();

  // Register prototypes
  registry.register('admin-profile', new UserProfile({
    permissions: new Set(['read', 'write', 'delete', 'admin']),
    settings: {
      theme: 'dark',
      language: 'en',
      notifications: { email: true, push: true, sms: true }
    }
  }));

  registry.register('guest-profile', new UserProfile({
    permissions: new Set(['read']),
    settings: {
      theme: 'light',
      language: 'en',
      notifications: { email: false, push: false, sms: false }
    }
  }));

  registry.register('api-request', baseRequest);

  console.log('Registered Prototypes:', registry.list());

  // Create instances from registry
  const newAdmin = registry.clone('admin-profile');
  newAdmin.username = 'admin1';
  newAdmin.email = 'admin1@example.com';

  const newGuest = registry.clone('guest-profile');
  newGuest.username = 'guest1';
  newGuest.email = 'guest1@example.com';

  console.log(`\nCreated admin: ${newAdmin.username} with ${newAdmin.permissions.size} permissions`);
  console.log(`Created guest: ${newGuest.username} with ${newGuest.permissions.size} permissions`);

  // Example 6: State Manager with Undo
  console.log('\n\n--- Example 6: State Manager with Undo/Redo ---\n');

  const initialState = new ApplicationState({ route: '/home' });
  const stateManager = new StateManager(initialState);

  console.log(`Initial route: ${stateManager.getState().route}`);

  // Make changes and save states
  stateManager.getState().route = '/dashboard';
  stateManager.save();
  console.log(`Changed to: ${stateManager.getState().route}`);

  stateManager.getState().route = '/profile';
  stateManager.save();
  console.log(`Changed to: ${stateManager.getState().route}`);

  stateManager.getState().route = '/settings';
  stateManager.save();
  console.log(`Changed to: ${stateManager.getState().route}`);

  console.log(`\nHistory size: ${stateManager.getHistorySize()}`);

  // Undo operations
  console.log('\nUndoing...');
  stateManager.undo();
  console.log(`After undo: ${stateManager.getState().route}`);

  stateManager.undo();
  console.log(`After undo: ${stateManager.getState().route}`);

  // Example 7: Object Pool
  console.log('\n\n--- Example 7: Object Pool for Performance ---\n');

  const requestPrototype = new APIRequest({
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  const pool = new ObjectPool(requestPrototype, 5);

  console.log('Initial pool stats:', pool.getStats());

  // Acquire objects from pool
  const req1 = pool.acquire();
  const req2 = pool.acquire();
  const req3 = pool.acquire();

  console.log('After acquiring 3 objects:', pool.getStats());

  // Release objects back to pool
  pool.release(req1);
  pool.release(req2);

  console.log('After releasing 2 objects:', pool.getStats());

  // Example 8: Deep Clone with Complex Structures
  console.log('\n\n--- Example 8: Deep Clone with Circular References ---\n');

  const complexObj = {
    name: 'Complex Object',
    date: new Date(),
    regex: /test/gi,
    map: new Map([['key1', 'value1'], ['key2', { nested: true }]]),
    set: new Set([1, 2, 3]),
    array: [1, 2, { nested: 'value' }]
  };

  // Add circular reference
  complexObj.self = complexObj;

  const cloned = deepClone(complexObj);
  cloned.name = 'Cloned Object';
  cloned.map.set('key3', 'value3');
  cloned.set.add(4);

  console.log('Original:', complexObj.name);
  console.log('Cloned:', cloned.name);
  console.log('Original Map size:', complexObj.map.size);
  console.log('Cloned Map size:', cloned.map.size);
  console.log('Circular reference handled:', cloned.self === cloned);

  // Example 9: Pattern Benefits
  console.log('\n\n--- Example 9: Pattern Benefits ---\n');

  console.log('Benefits of Prototype Pattern:');
  console.log('  1. Performance: Cloning is faster than creating from scratch for complex objects');
  console.log('  2. Flexibility: Can clone objects without knowing their exact class');
  console.log('  3. Configuration: Easy to create variations of complex configurations');
  console.log('  4. State Management: Perfect for undo/redo and snapshots');
  console.log('  5. Object Pool: Reuse cloned objects for better memory management');
  console.log('  6. Deep Copy: Handles complex nested structures and circular references');

  console.log('\n=== Demo Complete ===');
}

// Run the demo
if (require.main === module) {
  main();
}

module.exports = { main };
