# Proxy Pattern

## Intent
The Proxy pattern provides a substitute or placeholder for another object. A proxy controls access to the original object, allowing you to perform something either before or after the request gets to the original object.

## Also Known As
Surrogate

## Problem
You need to control access to an object for various reasons:
- Object is expensive to create (should be created on demand)
- Need access control (permissions checking)
- Need to add functionality (logging, caching) without modifying the object
- Object is in different address space (remote proxy)

## Solution
Create a proxy class with the same interface as the original object. The proxy maintains a reference to the real object and forwards requests to it, while adding additional behavior before or after forwarding.

## Real-World Analogy
A credit card is a proxy for a bank account:
- **Real Object**: Bank account with actual money
- **Proxy**: Credit card
- **Benefits**:
  - Don't need to carry cash (lazy loading)
  - Can implement spending limits (access control)
  - Tracks all transactions (logging)
  - Works remotely (remote proxy)

Similarly, a lawyer is a proxy for you in court - they represent you and control access to you.

## Types of Proxies

### 1. Virtual Proxy (Lazy Loading)
Delays creation of expensive object until it's needed.
- **Example**: Image loading - create proxy immediately, load actual image when displayed
- **Benefits**: Save memory and loading time

### 2. Protection Proxy (Access Control)
Controls access based on permissions.
- **Example**: Sensitive documents - check user role before granting access
- **Benefits**: Security, access control

### 3. Remote Proxy
Represents object in different address space.
- **Example**: API client, remote service
- **Benefits**: Location transparency

### 4. Caching Proxy
Caches results of expensive operations.
- **Example**: Database queries, API calls
- **Benefits**: Performance improvement

### 5. Logging Proxy
Logs all accesses to object.
- **Example**: Audit trail, debugging
- **Benefits**: Monitoring, debugging

### 6. Smart Reference
Adds additional actions when object is accessed.
- **Example**: Reference counting, locking
- **Benefits**: Resource management

## Structure
- **Subject (Image)**: Interface for both RealSubject and Proxy
- **RealSubject (RealImage)**: The real object that proxy represents
- **Proxy (ImageProxy)**: Maintains reference to real object, controls access, may create/destroy it
- **Client**: Works with objects through Subject interface

## Example Use Case
This implementation demonstrates image loading with various proxy types:
- **Virtual Proxy**: Loads images only when displayed (lazy loading)
- **Protection Proxy**: Checks user permissions before allowing access
- **Caching Proxy**: Caches display results for better performance
- **Logging Proxy**: Logs all image accesses for monitoring

## When to Use
- **Virtual Proxy**: Object is expensive to create, not always needed
- **Protection Proxy**: Need access control based on permissions
- **Remote Proxy**: Object is in different address space
- **Caching Proxy**: Need to cache results of expensive operations
- **Logging Proxy**: Need to log accesses for audit/debugging
- **Smart Reference**: Need additional housekeeping when object is accessed

## Benefits
1. **Control**: Control access to object
2. **Lazy initialization**: Create expensive objects on demand
3. **Security**: Add access control without modifying object
4. **Performance**: Add caching, connection pooling
5. **Logging**: Monitor object usage
6. **Transparency**: Client code doesn't know it's using a proxy
7. **Open/Closed**: Add functionality without modifying real object

## Trade-offs
- Additional indirection may slow response
- Increased code complexity
- May introduce subtle bugs if proxy doesn't perfectly mimic real object

## Proxy vs Similar Patterns

### Proxy vs Adapter
- **Proxy**: Same interface as real object, controls access
- **Adapter**: Different interface, makes incompatible interfaces compatible

### Proxy vs Decorator
- **Proxy**: Controls access, may manage object lifecycle
- **Decorator**: Adds responsibilities, always has reference to decorated object

### Proxy vs Facade
- **Proxy**: Same interface, single object
- **Facade**: Simplified interface, multiple objects (subsystem)

## Implementation Considerations

### Proxy Interface
Proxy should implement the same interface as real object for transparency.

### Lazy Initialization
Virtual proxies create real object on first access:
```javascript
if (this.realImage === null) {
  this.realImage = new RealImage(this.filename);
}
```

### Access Control
Protection proxies check permissions:
```javascript
if (!this.checkAccess(userRole)) {
  throw new Error('Access denied');
}
```

### Caching
Cache expensive operations:
```javascript
if (this.cache.has(key)) {
  return this.cache.get(key);
}
```

## Related Patterns
- **Adapter**: Similar structure, different purpose (interface conversion)
- **Decorator**: Adds responsibilities; proxy controls access
- **Facade**: Simplifies complex subsystem; proxy has same interface

## Real-World Applications
- **Virtual Proxy**: Image loading, large document handling, video streaming
- **Protection Proxy**: User authentication, file permissions, API access control
- **Remote Proxy**: Web services, RPC, distributed objects
- **Caching Proxy**: HTTP caching, database query caching
- **Logging Proxy**: Security auditing, performance monitoring

## How to Run
```bash
node index.js
```

## Output
The demo shows:
1. Direct object creation (without proxy) loads everything immediately
2. Virtual proxy delays loading until needed
3. Protection proxy enforces access control
4. Caching proxy improves performance with cache hits
5. Logging proxy tracks all accesses
6. Comparison of proxy types
7. Benefits over direct object use
8. Practical image gallery application
