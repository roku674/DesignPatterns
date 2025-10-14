# Minimal API Pattern

## Intent
Create lightweight HTTP APIs in ASP.NET Core without controllers, using route handlers and endpoint definitions for simplified API development.

## Pattern Type
Architectural Pattern (ASP.NET Core-specific)

## Also Known As
- Lightweight API
- Controller-less API
- Route Handler Pattern

## Motivation
Traditional MVC controllers add overhead and boilerplate for simple APIs. Minimal APIs provide a streamlined approach focused on endpoint definitions, reducing code complexity while maintaining full ASP.NET Core capabilities.

## Applicability
Use Minimal APIs when:
- Building microservices with focused APIs
- Creating simple CRUD operations
- Rapid prototyping is needed
- Reducing startup time and memory footprint is important
- You don't need complex controller features (action filters, model binding)
- Building serverless or container-based applications

## Structure
```
┌─────────────────────────────────────────┐
│      WebApplication Builder             │
│  - Configure Services                   │
│  - Add Dependencies                     │
└─────────────┬───────────────────────────┘
              │
    ┌─────────▼──────────┐
    │  Service Registry  │
    │  - Repositories    │
    │  - Validators      │
    │  - Logging         │
    └─────────┬──────────┘
              │
    ┌─────────▼──────────┐
    │  WebApplication    │
    │  - Middleware      │
    │  - Endpoint Routes │
    └─────────┬──────────┘
              │
    ┌─────────▼──────────────────────────┐
    │       Endpoint Mapping             │
    │  ┌──────────────────────────────┐  │
    │  │  GET /api/products           │  │
    │  │  └─► Handler(repo, logger)   │  │
    │  ├──────────────────────────────┤  │
    │  │  POST /api/products          │  │
    │  │  └─► Handler(request, repo)  │  │
    │  ├──────────────────────────────┤  │
    │  │  PUT /api/products/{id}      │  │
    │  │  └─► Handler(id, request)    │  │
    │  └──────────────────────────────┘  │
    └────────────────────────────────────┘
```

## Key Features
- **No Controllers**: Direct endpoint definitions
- **Lambda Handlers**: Inline or method-based handlers
- **Dependency Injection**: Full DI support in handlers
- **Route Parameters**: Type-safe parameter binding
- **Built-in Validation**: Parameter and model validation
- **OpenAPI Support**: Swagger/OpenAPI generation
- **Performance**: Lower overhead than MVC

## Real-World Applications
1. **Microservices**: Lightweight service endpoints
2. **Serverless Functions**: Azure Functions, AWS Lambda
3. **Container APIs**: Docker/Kubernetes deployments
4. **API Gateways**: Backend-for-frontend patterns
5. **IoT Services**: Resource-constrained environments

## Best Practices
1. Group related endpoints using MapGroup
2. Use extension methods for endpoint organization
3. Keep handlers focused and single-purpose
4. Implement proper validation
5. Use typed responses with ApiResponse<T>
6. Add OpenAPI documentation
7. Implement health check endpoints
8. Use proper HTTP status codes

## Technology Stack
- ASP.NET Core 6.0+ (Minimal APIs introduced)
- Microsoft.AspNetCore.OpenApi
- Microsoft.Extensions.DependencyInjection

## Key Takeaways
1. Minimal APIs reduce boilerplate for simple scenarios
2. 30% faster startup than MVC controllers
3. 15% lower memory footprint
4. Full dependency injection support
5. Type-safe route parameters
6. Easy to test with IResult
7. Scales from simple to complex APIs
8. Perfect for microservices and serverless
