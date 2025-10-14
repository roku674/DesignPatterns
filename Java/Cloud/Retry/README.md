# Retry Pattern

## Intent
Enable an application to handle transient failures when connecting to a service or network resource by transparently retrying failed operations. This pattern improves application stability and resilience in cloud environments.

## Problem
Cloud applications frequently interact with remote services and resources. These interactions can experience transient faults such as:
- Momentary loss of network connectivity
- Temporary unavailability of a service
- Timeouts from service overload
- Rate limiting or throttling

Immediate retry after a failure often results in the same error. Applications need intelligent retry logic to handle these temporary issues gracefully.

## Solution
Implement retry logic that:
1. Detects transient failures vs permanent errors
2. Waits an appropriate amount of time before retrying
3. Uses backoff strategies (fixed, exponential) to avoid overwhelming the service
4. Applies jitter to prevent synchronized retries (thundering herd)
5. Limits maximum retry attempts to avoid infinite loops

## Structure
```
RetryPolicy
├── BackoffStrategy (interface)
│   ├── FixedBackoffStrategy
│   └── ExponentialBackoffStrategy
├── RetryExecutor
└── AsyncRetryExecutor
```

## Key Components

### RetryPolicy
Defines retry behavior including:
- Maximum retry attempts
- Backoff strategy (fixed or exponential)
- Retryable exception types
- Non-retryable exception types
- Custom retry conditions
- Jitter configuration
- Maximum delay cap

### BackoffStrategy
Calculates delay between retry attempts:
- **Fixed**: Same delay between all attempts
- **Exponential**: Increasing delay (e.g., 100ms, 200ms, 400ms, 800ms)

### RetryExecutor
Executes synchronous operations with retry logic.

### AsyncRetryExecutor
Executes asynchronous operations with retry logic using CompletableFuture.

## Implementation Details

### Exponential Backoff Formula
```
delay = initialDelay * (multiplier ^ (attempt - 1))
```

### Jitter Application
```
jitteredDelay = baseDelay * (1 + random(-jitter, +jitter))
```

### Example: Basic Retry
```java
RetryPolicy policy = RetryPolicy.builder()
    .maxAttempts(3)
    .fixedDelay(Duration.ofSeconds(1))
    .retryableExceptions(TransientException.class)
    .build();

RetryExecutor executor = new RetryExecutor(policy);
String result = executor.execute(() -> service.performOperation());
```

### Example: Exponential Backoff with Jitter
```java
RetryPolicy policy = RetryPolicy.builder()
    .maxAttempts(5)
    .exponentialBackoff(Duration.ofMillis(100), 2.0)
    .jitter(0.3) // 30% jitter
    .maxDelay(Duration.ofSeconds(10))
    .retryableExceptions(TransientException.class)
    .build();
```

### Example: Custom Retry Condition
```java
RetryPolicy policy = RetryPolicy.builder()
    .maxAttempts(3)
    .exponentialBackoff(Duration.ofMillis(100), 2.0)
    .retryCondition((attempt, exception) -> {
        // Don't retry rate limit errors
        if (exception instanceof RateLimitException) {
            return false;
        }
        // Don't retry 4xx HTTP errors
        if (exception instanceof HttpException) {
            int status = ((HttpException) exception).getStatusCode();
            return status >= 500; // Only retry 5xx errors
        }
        return true;
    })
    .build();
```

## When to Use
- Calling external REST APIs
- Database connection attempts
- Message queue operations
- Cloud storage operations (S3, Blob Storage)
- Microservice-to-microservice communication
- Any operation with potential transient failures

## When Not to Use
- Operations that are not idempotent (unless carefully designed)
- Permanent errors (validation failures, 404 errors)
- Long-running operations with high failure rates
- When immediate feedback is critical

## Cloud Platform Examples

### AWS
- **S3 Operations**: Retry on network timeouts, throttling
- **DynamoDB**: Retry on ProvisionedThroughputExceededException
- **SQS**: Retry on service unavailability
- **Lambda Invocations**: Retry on timeout or throttling

### Azure
- **Blob Storage**: Retry on transient network errors
- **Service Bus**: Retry on message lock timeouts
- **Cosmos DB**: Retry on rate limiting (429 errors)
- **Functions**: Retry on execution failures

### GCP
- **Cloud Storage**: Retry on 500-level errors
- **Pub/Sub**: Retry on publish failures
- **Firestore**: Retry on contention errors
- **Cloud Functions**: Retry on execution timeouts

## Best Practices

1. **Idempotency**: Ensure operations can be safely retried
2. **Appropriate Backoff**: Use exponential backoff to avoid overwhelming services
3. **Jitter**: Add randomness to prevent synchronized retries
4. **Max Attempts**: Set reasonable limits to avoid infinite loops
5. **Max Delay**: Cap exponential delays to prevent excessive waits
6. **Exception Classification**: Distinguish transient vs permanent errors
7. **Monitoring**: Log retry attempts and patterns
8. **Circuit Breaker**: Combine with Circuit Breaker for enhanced resilience

## Related Patterns
- **Circuit Breaker**: Prevents cascading failures
- **Timeout**: Limits wait time for operations
- **Bulkhead**: Isolates failures to prevent spread
- **Rate Limiting**: Prevents overwhelming downstream services

## Performance Considerations
- Retries increase latency and resource usage
- Exponential backoff can lead to long waits
- Too many concurrent retries can overwhelm services
- Balance between resilience and performance

## Real-World Scenarios Demonstrated
1. **AWS S3 Upload**: Retry file uploads on network timeouts
2. **Azure Service Bus**: Retry message sends with jitter
3. **GCP Pub/Sub**: Retry event publishing with backoff
4. **Database Connection**: Retry connections with increasing delays
5. **Microservice API**: Retry with custom logic for HTTP status codes

## Testing Considerations
- Simulate transient failures
- Test exponential backoff timing
- Verify jitter distribution
- Test max attempts boundary
- Validate exception classification
- Test async retry behavior

## Metrics to Monitor
- Retry attempt count per operation
- Success rate after retries
- Average retry duration
- Max retries reached
- Exception types triggering retries
- Impact on overall latency

## References
- Microsoft Azure Architecture: Retry Pattern
- AWS Well-Architected Framework: Reliability Pillar
- Google Cloud Best Practices: Error Handling
- "Release It!" by Michael Nygard
