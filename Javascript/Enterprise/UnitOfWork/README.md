# Unit of Work Pattern

## Intent
Maintains a list of objects affected by a business transaction and coordinates the writing out of changes and resolution of concurrency problems.

## When to Use
- Multiple objects need to be persisted together
- Need transactional consistency across multiple operations
- Want to minimize database roundtrips
- Need to track object changes automatically
- Complex object graphs need persistence

## Structure
- Tracks new, modified, and deleted objects
- Commits all changes in a single transaction
- Maintains identity map
- Coordinates with data mappers

## Example
Demonstrates:
- Registering new entities
- Tracking modifications
- Handling deletions
- Batch commit
- Identity map integration

## Benefits
- Ensures transactional consistency
- Reduces database calls
- Automatic change tracking
- Simplified client code
- Better performance

## Drawbacks
- Complex implementation
- Memory overhead
- Potential for large transactions
- Concurrency issues

## Run
```bash
node index.js
```
