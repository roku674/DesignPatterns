# Middleware Pipeline Pattern

## Intent
Create custom middleware components that form a pipeline for processing HTTP requests and responses in ASP.NET Core. Each middleware can perform operations before and after the next middleware in the pipeline.

## Pattern Type
Architectural Pattern (ASP.NET Core-specific)

## Also Known As
- Request Pipeline Pattern
- HTTP Pipeline
- Middleware Chain

## Motivation
In ASP.NET Core applications, you need a flexible way to process HTTP requests and responses with cross-cutting concerns like logging, authentication, error handling, and performance monitoring. The middleware pipeline provides a clean, composable way to add these features without cluttering your business logic.

## Applicability
Use the Middleware Pipeline pattern when:
- You need to process requests/responses at the application level
- You want to implement cross-cutting concerns (logging, security, performance)
- You need to short-circuit the pipeline based on conditions
- You want to add custom headers or modify responses
- You need to handle exceptions globally
- You want to create reusable request processing components

## Structure
```
┌─────────────────────────────────────────────┐
│         HTTP Request                        │
└─────────────────┬───────────────────────────┘
                  │
         ┌────────▼────────┐
         │  Middleware 1   │ ──┐ Before
         └────────┬────────┘   │
                  │            │
         ┌────────▼────────┐  │
         │  Middleware 2   │ ─┼─ Before
         └────────┬────────┘  │
                  │           │
         ┌────────▼────────┐ │
         │  Middleware 3   │ ┼─ Before
         └────────┬────────┘ │
                  │          │
         ┌────────▼────────┐│
         │  Final Handler  ││
         └────────┬────────┘│
                  │         │
         ┌────────▼────────┐│
         │  Middleware 3   │┼─ After
         └────────┬────────┘│
                  │         │
         ┌────────▼────────┐│
         │  Middleware 2   │┼─ After
         └────────┬────────┘│
                  │         │
         ┌────────▼────────┐
         │  Middleware 1   │──┘ After
         └────────┬────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         HTTP Response                       │
└─────────────────────────────────────────────┘
```

## Participants
- **ICustomMiddleware**: Interface for custom middleware components
- **RequestLoggingMiddleware**: Logs request details and timing
- **PerformanceMonitoringMiddleware**: Tracks request performance
- **CorrelationIdMiddleware**: Manages correlation IDs across requests
- **SecurityHeadersMiddleware**: Adds security headers to responses
- **RequestValidationMiddleware**: Validates incoming requests
- **ExceptionHandlingMiddleware**: Handles exceptions globally
- **MiddlewarePipelineBuilder**: Builds the middleware pipeline
- **MiddlewareExtensions**: Extension methods for easy registration

## Implementation Details

### Key Components

1. **Custom Middleware Interface**
```csharp
public interface ICustomMiddleware
{
    Task InvokeAsync(HttpContext context, RequestDelegate next);
}
```

2. **Middleware Implementation Pattern**
```csharp
public async Task InvokeAsync(HttpContext context, RequestDelegate next)
{
    // Before logic
    await DoSomethingBefore(context);

    // Call next middleware
    await next(context);

    // After logic
    await DoSomethingAfter(context);
}
```

3. **Short-Circuit Pattern**
```csharp
public async Task InvokeAsync(HttpContext context, RequestDelegate next)
{
    if (ShouldShortCircuit(context))
    {
        context.Response.StatusCode = 400;
        return; // Don't call next
    }

    await next(context);
}
```

## Collaborations
- Middleware components are chained together in a specific order
- Each middleware can access the HttpContext
- Each middleware decides whether to call the next middleware
- Response processing happens in reverse order

## Consequences

### Benefits
1. **Separation of Concerns**: Each middleware handles one responsibility
2. **Reusability**: Middleware can be reused across applications
3. **Composability**: Easy to add/remove/reorder middleware
4. **Testability**: Each middleware can be tested independently
5. **Flexibility**: Can short-circuit the pipeline when needed
6. **Clean Code**: Keeps controllers focused on business logic

### Drawbacks
1. **Order Dependency**: Middleware order matters and can cause bugs
2. **Performance**: Many middleware can impact performance
3. **Complexity**: Large pipelines can be hard to understand
4. **Debugging**: Flow through multiple middleware can be tricky
5. **Hidden Behavior**: Middleware behavior may not be obvious

## Best Practices

1. **Order Matters**
   - Exception handling should be first
   - Authentication before authorization
   - Logging early in the pipeline
   - CORS before authentication

2. **Performance Considerations**
   - Keep middleware lightweight
   - Avoid expensive operations
   - Use async/await properly
   - Cache expensive computations

3. **Error Handling**
   - Always handle exceptions
   - Provide meaningful error messages
   - Log errors appropriately
   - Don't leak sensitive information

4. **Testing**
   - Test each middleware independently
   - Test middleware interactions
   - Test short-circuit scenarios
   - Mock HttpContext for testing

5. **Configuration**
   - Make middleware configurable
   - Use options pattern for settings
   - Register via extension methods
   - Document configuration options

## Usage Examples

### Basic Usage
```csharp
app.UseExceptionHandling();
app.UseCorrelationId();
app.UseRequestLogging();
app.UsePerformanceMonitoring(warningThresholdMs: 500);
app.UseSecurityHeaders();
app.UseRequestValidation();
```

### Custom Middleware
```csharp
public class ApiKeyMiddleware : ICustomMiddleware
{
    private readonly string _apiKey;

    public ApiKeyMiddleware(IConfiguration config)
    {
        _apiKey = config["ApiKey"];
    }

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        if (!context.Request.Headers.TryGetValue("X-API-Key", out var key)
            || key != _apiKey)
        {
            context.Response.StatusCode = 401;
            return;
        }

        await next(context);
    }
}
```

### Pipeline Builder
```csharp
var builder = new MiddlewarePipelineBuilder();
builder
    .UseMiddleware<RequestLoggingMiddleware>()
    .Use(async (context, next) => {
        // Custom inline middleware
        await next(context);
    })
    .UseMiddleware<PerformanceMonitoringMiddleware>(1000);

var pipeline = builder.Build(finalHandler);
```

## Real-World Applications

1. **API Gateway**: Request routing, authentication, rate limiting
2. **Logging System**: Request/response logging, correlation IDs
3. **Security**: Authentication, authorization, CORS, security headers
4. **Performance**: Caching, compression, performance monitoring
5. **Diagnostics**: Health checks, metrics collection, tracing

## Related Patterns
- **Chain of Responsibility**: Middleware is a specific implementation
- **Decorator**: Each middleware decorates the next
- **Pipe and Filter**: Similar request processing pattern
- **Interceptor**: Similar concept in different contexts

## Technology Stack
- ASP.NET Core 6.0+
- Microsoft.AspNetCore.Http
- Microsoft.Extensions.Logging
- Microsoft.Extensions.DependencyInjection

## Key Takeaways
1. Middleware provides a clean way to process HTTP requests/responses
2. Order of middleware registration is critical
3. Each middleware can short-circuit the pipeline
4. Use for cross-cutting concerns like logging, security, performance
5. Keep middleware focused and lightweight
6. Test each middleware component independently
7. Use extension methods for clean registration
8. Handle exceptions properly to avoid breaking the pipeline
