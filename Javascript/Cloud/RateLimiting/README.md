# Rate Limiting Pattern

## Overview
The Rate Limiting pattern controls the rate at which requests are processed to prevent system overload, ensure fair usage, and protect against abuse.

## Types Implemented
- **Per-User Rate Limiting**: Separate limits for each user/client
- **Global Rate Limiting**: System-wide rate limits
- **Adaptive Rate Limiting**: Dynamic limits based on system load
- **Tiered Rate Limiting**: Different limits for user tiers
- **Distributed Rate Limiting**: Rate limiting across multiple servers

## Usage Examples

### Per-User Rate Limiting
```javascript
const { RateLimiting } = require('./RateLimiting');

const limiter = new RateLimiting({
  type: 'per-user',
  maxRequests: 100,
  windowSize: 60000 // 1 minute
});

const result = limiter.allowRequest('user-123');
if (result.allowed) {
  // Process request
  console.log(`Request allowed. Remaining: ${result.remaining}`);
} else {
  console.log(`Rate limit exceeded. Retry after: ${result.retryAfter}ms`);
}
```

### Tiered Rate Limiting
```javascript
const limiter = new RateLimiting({
  type: 'tiered',
  tiers: {
    free: 100,
    premium: 1000,
    enterprise: 10000
  },
  windowSize: 60000
});

const result = limiter.allowRequest('user-123', 'premium');
```

### Adaptive Rate Limiting
```javascript
const limiter = new RateLimiting({
  type: 'adaptive',
  maxRequests: 1000,
  windowSize: 60000
});

// Update system load (0.0 to 1.0)
limiter.updateLoad(0.8); // High load - reduces rate limit

const result = limiter.allowRequest();
```

## When to Use
- API rate limiting
- DDoS protection
- Fair resource allocation
- Preventing abuse
- Managing system load
