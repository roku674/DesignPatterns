# Data Transfer Object Pattern

## Intent
An object that carries data between processes to reduce the number of method calls.

## Use When
- You need to transfer data across network boundaries
- You want to reduce the number of remote calls
- You need to aggregate data from multiple sources
- You want to decouple domain model from data transfer format

## Benefits
- Reduces network latency by batching data
- Simplifies remote interface
- Provides clear data contract
- Enables versioning of data structures

## Implementation
Run: `node index.js`
