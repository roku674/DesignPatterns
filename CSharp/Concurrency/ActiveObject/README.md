# ActiveObject Pattern

## Intent
Decouples method execution from invocation to enable asynchronous processing and improved concurrency control. This pattern allows client code to submit method requests and continue processing without blocking, while requests are executed serially by a dedicated scheduler thread.

## When to Use
- When you need to decouple method invocation from execution
- To serialize access to an object that may be accessed by multiple threads
- When implementing asynchronous operations with thread-safe execution
- To implement a single-threaded execution model for concurrent method calls
- When you need to queue and prioritize method requests

## Structure
- **IActiveObject**: Interface defining the pattern contract
- **ActiveObjectImplementation**: Concrete implementation with request queue and scheduler
- **IMethodRequest**: Interface for method requests that can be executed asynchronously
- **Future<T>**: Represents a result that will be available after asynchronous execution
- **Scheduler**: Background thread that processes queued method requests
- **Request Classes**: Concrete implementations of method requests (IncrementRequest, GetValueRequest, ComputeRequest)

## Key Components

### 1. Method Request Interface
Defines the contract for requests that can be executed asynchronously.

### 2. Future/Promise
Provides a handle to retrieve results from asynchronous operations.

### 3. Request Queue
Thread-safe queue that stores pending method requests.

### 4. Scheduler
Single background thread that dequeues and executes requests serially.

### 5. Proxy Methods
Client-facing methods that create requests, enqueue them, and return futures.

## Benefits
- Thread-safe access without explicit locking in client code
- Asynchronous method invocation with future-based results
- Serial execution prevents race conditions
- Improved concurrency and responsiveness
- Clean separation between invocation and execution

## How to Run
```bash
cd /home/roku674/Alex/DesignPatterns/CSharp/Concurrency/ActiveObject
dotnet run
```

## References
- Pattern-Oriented Software Architecture Volume 2: Patterns for Concurrent and Networked Objects
- Design Patterns: Elements of Reusable Object-Oriented Software
