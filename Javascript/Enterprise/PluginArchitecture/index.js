const { PluginHost, AuthPlugin, LoggingPlugin } = require('./PluginArchitecture');

console.log('=== Plugin Architecture Pattern Demo ===\n');

const host = new PluginHost();

console.log('1. Loading plugins');
host.loadPlugin(new AuthPlugin());
host.loadPlugin(new LoggingPlugin());
console.log(`   Loaded ${host.plugins.length} plugins`);

console.log('\n2. Executing onRequest hook');
host.executeHook('onRequest', { method: 'GET', path: '/api/users' });

console.log('\n3. Executing onResponse hook');
host.executeHook('onResponse', { status: 200 });

console.log('\n=== Benefits ===');
console.log('✓ Highly extensible');
console.log('✓ Hook-based architecture');
console.log('✓ Decoupled plugins');
