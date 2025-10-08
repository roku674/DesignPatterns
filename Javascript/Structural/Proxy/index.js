/**
 * Proxy Pattern - Demo
 */

const {
  RealImage,
  ImageProxy,
  ProtectedImageProxy,
  CachingImageProxy,
  LoggingImageProxy
} = require('./image-proxy');

console.log('=== Proxy Pattern Demo ===\n');

// Example 1: Without Proxy (Direct access)
console.log('=== Example 1: WITHOUT Proxy (Direct Loading) ===\n');

console.log('Creating 3 images directly:');
const img1 = new RealImage('photo1.jpg');
const img2 = new RealImage('photo2.jpg');
const img3 = new RealImage('photo3.jpg');

console.log('\nAll images loaded immediately, even if not needed!');
console.log('(Notice the loading time for each)\n');

// Example 2: Virtual Proxy (Lazy Loading)
console.log('=== Example 2: Virtual Proxy (Lazy Loading) ===\n');

console.log('Creating 3 image proxies:');
const proxy1 = new ImageProxy('photo4.jpg');
const proxy2 = new ImageProxy('photo5.jpg');
const proxy3 = new ImageProxy('photo6.jpg');

console.log('\nProxies created instantly! Real images NOT loaded yet.');

console.log('\nNow displaying first image:');
proxy1.display();

console.log('\nDisplaying first image again (already loaded):');
proxy1.display();

console.log('\nDisplaying second image (first time):');
proxy2.display();

console.log('\n(Notice: photo6.jpg was never loaded - saved resources!)\n');

// Example 3: Protection Proxy (Access Control)
console.log('=== Example 3: Protection Proxy (Access Control) ===\n');

const secretImage = new ProtectedImageProxy('classified.jpg', 'admin');

console.log('Attempting access with different roles:\n');

console.log('Guest trying to access:');
secretImage.display('guest');

console.log('\nUser trying to access:');
secretImage.display('user');

console.log('\nAdmin trying to access:');
secretImage.display('admin');

console.log('\nAdmin accessing again:');
secretImage.display('admin');

// Example 4: Caching Proxy
console.log('\n\n=== Example 4: Caching Proxy ===\n');

const cachedImage = new CachingImageProxy('large_image.jpg');

console.log('First display (cache miss):');
cachedImage.display({ size: 'large' });

console.log('\nSecond display with same options (cache hit):');
cachedImage.display({ size: 'large' });

console.log('\nThird display with same options (cache hit):');
cachedImage.display({ size: 'large' });

console.log('\nDisplay with different options (cache miss):');
cachedImage.display({ size: 'thumbnail' });

console.log('\nDisplay with first options again (cache hit):');
cachedImage.display({ size: 'large' });

console.log('\nCache statistics:');
console.log(cachedImage.getInfo().cacheStats);

// Example 5: Logging Proxy
console.log('\n\n=== Example 5: Logging Proxy ===\n');

const loggedImage = new LoggingImageProxy('monitored.jpg');

console.log('Multiple accesses to image:\n');
loggedImage.display();
loggedImage.display();
loggedImage.display();

console.log('\nAccess log:');
const log = loggedImage.getAccessLog();
log.forEach((entry, index) => {
  console.log(`${index + 1}. ${entry.action} at ${entry.timestamp}`);
});

// Example 6: Proxy types comparison
console.log('\n\n=== Example 6: Proxy Types Summary ===\n');

console.log('1. Virtual Proxy (Lazy Loading):');
console.log('   - Delays object creation until needed');
console.log('   - Use when: Object is expensive to create');
console.log('   - Example: Image loading, database connections\n');

console.log('2. Protection Proxy (Access Control):');
console.log('   - Controls access based on permissions');
console.log('   - Use when: Need access control');
console.log('   - Example: Sensitive data, paid content\n');

console.log('3. Caching Proxy:');
console.log('   - Caches results of expensive operations');
console.log('   - Use when: Operations are expensive and repeatable');
console.log('   - Example: API calls, database queries\n');

console.log('4. Logging Proxy:');
console.log('   - Logs all accesses to object');
console.log('   - Use when: Need audit trail');
console.log('   - Example: Security monitoring, debugging\n');

// Example 7: Benefits demonstration
console.log('=== Example 7: Proxy Pattern Benefits ===\n');

console.log('WITHOUT Proxy:');
console.log('  ✗ All objects created immediately (resource waste)');
console.log('  ✗ No access control');
console.log('  ✗ No caching');
console.log('  ✗ No logging');
console.log('  ✗ Clients directly coupled to real objects\n');

console.log('WITH Proxy:');
console.log('  ✓ Lazy initialization (save resources)');
console.log('  ✓ Access control (security)');
console.log('  ✓ Caching (performance)');
console.log('  ✓ Logging (monitoring)');
console.log('  ✓ Transparent to client');
console.log('  ✓ Can add functionality without changing real object\n');

// Example 8: Practical use case - Image Gallery
console.log('=== Example 8: Practical Image Gallery ===\n');

class ImageGallery {
  constructor() {
    this.images = [];
  }

  addImage(filename, requiresAuth = false) {
    if (requiresAuth) {
      this.images.push(new ProtectedImageProxy(filename, 'user'));
    } else {
      this.images.push(new ImageProxy(filename)); // Lazy loading
    }
  }

  viewImage(index, userRole = 'guest') {
    if (index < 0 || index >= this.images.length) {
      console.log('Invalid image index');
      return;
    }

    const image = this.images[index];
    console.log(`\nViewing image ${index + 1}/${this.images.length}:`);

    if (image instanceof ProtectedImageProxy) {
      image.display(userRole);
    } else {
      image.display();
    }
  }
}

const gallery = new ImageGallery();
gallery.addImage('public1.jpg', false);
gallery.addImage('public2.jpg', false);
gallery.addImage('premium1.jpg', true);
gallery.addImage('premium2.jpg', true);

console.log('Gallery created with 4 images (2 public, 2 premium)');
console.log('No images loaded yet (lazy loading)!\n');

console.log('Guest viewing public image:');
gallery.viewImage(0, 'guest');

console.log('\nGuest trying to view premium image:');
gallery.viewImage(2, 'guest');

console.log('\nUser viewing premium image:');
gallery.viewImage(2, 'user');

console.log('\n=== Demo Complete ===');
