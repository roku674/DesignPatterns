# Action Filter Pattern

## Intent
Implement cross-cutting concerns like validation, logging, caching, and performance monitoring in ASP.NET Core MVC applications using action filters.

## Pattern Type
Behavioral Pattern (ASP.NET Core MVC-specific)

## Also Known As
- MVC Filter
- Action Interceptor
- Controller Filter

## Motivation
Controllers should focus on business logic without being cluttered with cross-cutting concerns like logging, validation, caching, and performance monitoring. Action filters provide a clean way to inject these concerns before and after action execution.

## Applicability
Use Action Filters when:
- You need to validate model state before action execution
- You want to log action execution details
- You need to cache action results
- You want to monitor action performance
- You need to handle exceptions consistently
- You want to transform responses
- You need to implement rate limiting
- You want to add authorization logic

## Structure
```
┌──────────────────────────────────┐
│     HTTP Request                 │
└────────────┬─────────────────────┘
             │
    ┌────────▼────────┐
    │ Authorization   │
    │    Filter       │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │   Resource      │
    │    Filter       │ ──┐ Before
    └────────┬────────┘   │
             │            │
    ┌────────▼────────┐  │
    │   Action        │  │
    │    Filter       │ ─┼─ OnActionExecuting
    └────────┬────────┘  │
             │           │
    ┌────────▼────────┐ │
    │   Action        │ │
    │   Method        │ │
    └────────┬────────┘ │
             │          │
    ┌────────▼────────┐│
    │   Action        ││
    │    Filter       │┼─ OnActionExecuted
    └────────┬────────┘│
             │         │
    ┌────────▼────────┐│
    │   Result        ││
    │    Filter       │┼─ OnResultExecuting
    └────────┬────────┘│
             │         │
    ┌────────▼────────┐│
    │  Result         ││
    │ Execution       ││
    └────────┬────────┘│
             │         │
    ┌────────▼────────┐│
    │   Result        ││
    │    Filter       │┼─ OnResultExecuted
    └────────┬────────┘│
             │         │
    ┌────────▼────────┐
    │   Resource      │──┘ After
    │    Filter       │
    └────────┬────────┘
             │
┌────────────▼─────────────────────┐
│     HTTP Response                │
└──────────────────────────────────┘
```

## Participants
- **ActionFilterAttribute**: Base class for action filters
- **ValidateModelAttribute**: Validates model state
- **PerformanceMonitoringAttribute**: Tracks action performance
- **LogActionAttribute**: Logs action execution
- **CacheResponseAttribute**: Caches action results
- **RequireRoleAttribute**: Custom authorization
- **HandleExceptionAttribute**: Exception handling
- **ThrottleAttribute**: Rate limiting
- **TransformResponseAttribute**: Response transformation

## Real-World Applications
1. **E-Commerce**: Product catalog caching, order validation
2. **API Services**: Rate limiting, request logging, response transformation
3. **Admin Panels**: Role-based access control, audit logging
4. **Microservices**: Performance monitoring, correlation ID tracking
5. **SaaS Applications**: Feature flags, tenant isolation

## Technology Stack
- ASP.NET Core MVC 6.0+
- Microsoft.AspNetCore.Mvc
- Action Filters API

## Key Takeaways
1. Action filters separate cross-cutting concerns from business logic
2. Filters can run before and after actions
3. Multiple filters can be applied to a single action
4. Filter order matters - specify with Order property
5. Filters are reusable across multiple actions
6. Use attributes for declarative application
7. Test filters independently from controllers
8. Keep filters focused on single responsibility
