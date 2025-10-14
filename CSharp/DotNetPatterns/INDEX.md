# .NET Design Patterns - Quick Reference Index

## Navigation Guide

### Main Documentation
- **[README.md](README.md)** - Start here! Overview of all 40 patterns
- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Detailed specifications for implementing patterns
- **[PATTERN_STATUS.md](PATTERN_STATUS.md)** - Track completion progress
- **[COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md)** - Project summary and deliverables

## Implemented Patterns (6/40) ✅

### ASP.NET Core Patterns

#### 1. Middleware Pipeline ✅
**Location**: [AspNetCore/MiddlewarePipeline/](AspNetCore/MiddlewarePipeline/)
**Files**: [Program.cs](AspNetCore/MiddlewarePipeline/Program.cs) | [README.md](AspNetCore/MiddlewarePipeline/README.md)
**Lines**: 509
**What it does**: Custom middleware components for request/response processing pipeline
**Use when**: Building cross-cutting concerns like logging, authentication, error handling
**Key classes**: `ICustomMiddleware`, `RequestLoggingMiddleware`, `PerformanceMonitoringMiddleware`

#### 2. Action Filter ✅
**Location**: [AspNetCore/ActionFilter/](AspNetCore/ActionFilter/)
**Files**: [Program.cs](AspNetCore/ActionFilter/Program.cs) | [README.md](AspNetCore/ActionFilter/README.md)
**Lines**: 634
**What it does**: Cross-cutting concerns in MVC controllers (validation, caching, logging)
**Use when**: Need to intercept action execution for common behaviors
**Key classes**: `ValidateModelAttribute`, `PerformanceMonitoringAttribute`, `CacheResponseAttribute`

#### 3. Minimal API ✅
**Location**: [AspNetCore/MinimalAPI/](AspNetCore/MinimalAPI/)
**Files**: [Program.cs](AspNetCore/MinimalAPI/Program.cs) | [README.md](AspNetCore/MinimalAPI/README.md)
**Lines**: 627
**What it does**: Lightweight API endpoints without controllers
**Use when**: Building microservices, simple APIs, serverless functions
**Key classes**: `ProductEndpoints`, `IProductRepository`, `ApiResponse<T>`

#### 4. Background Service ✅
**Location**: [AspNetCore/BackgroundService/](AspNetCore/BackgroundService/)
**Files**: [Program.cs](AspNetCore/BackgroundService/Program.cs) | [README.md](AspNetCore/BackgroundService/README.md)
**Lines**: 541
**What it does**: Long-running background tasks with IHostedService
**Use when**: Scheduled tasks, queue processing, data synchronization
**Key classes**: `TimedBackgroundService`, `QueuedHostedService`, `DataSyncService`

### Entity Framework Core Patterns

#### 5. Repository with EF ✅
**Location**: [EntityFramework/RepositoryWithEF/](EntityFramework/RepositoryWithEF/)
**Files**: [Program.cs](EntityFramework/RepositoryWithEF/Program.cs) | [README.md](EntityFramework/RepositoryWithEF/README.md)
**Lines**: 645
**What it does**: Abstraction layer over Entity Framework Core data access
**Use when**: Need testable data access, multiple data sources, consistent API
**Key classes**: `IRepository<T>`, `IProductRepository`, `IUnitOfWork`

### Modern C# Patterns

#### 6. Async Streams ✅
**Location**: [ModernCSharp/AsyncStreams/](ModernCSharp/AsyncStreams/)
**Files**: [Program.cs](ModernCSharp/AsyncStreams/Program.cs) | [README.md](ModernCSharp/AsyncStreams/README.md)
**Lines**: 538
**What it does**: IAsyncEnumerable for efficient async iteration
**Use when**: Processing large datasets, streaming data, real-time data
**Key classes**: `AsyncLogReader`, `AsyncSensorStream`, `AsyncStreamExtensions`

## Patterns To Be Implemented (34/40) ⏳

### ASP.NET Core (11 remaining)
7. **Result Filter** - Response transformation
8. **Authorization Filter** - Custom authorization
9. **Exception Filter** - Global error handling
10. **Resource Filter** - Request/response wrapping
11. **Endpoint Routing** - Custom routing strategies
12. **Health Checks** - Application health monitoring
13. **SignalR Hub** - Real-time communication
14. **gRPC Service** - High-performance RPC
15. **API Versioning** - Version management
16. **Rate Limiting** - Request rate limiting
17. **Response Caching** - Output caching

### Entity Framework Core (9 remaining)
18. **DbContext Factory** - Context lifecycle management
19. **Unit of Work with EF** - Transaction management
20. **Specification Pattern** - Query specifications
21. **Soft Delete** - Logical deletion
22. **Audit Trail** - Change tracking
23. **Multi-Tenancy** - Tenant isolation
24. **Shadow Properties** - EF-only properties
25. **Value Converters** - Type conversion
26. **Global Query Filters** - Automatic filtering

### Dependency Injection (5 remaining)
27. **Scoped Service** - Request-scoped dependencies
28. **Singleton Service** - Application-scoped
29. **Transient Service** - Per-request dependencies
30. **Factory Pattern with DI** - Service factories
31. **Decorator Pattern with DI** - Service decoration

### Modern C# (9 remaining)
32. **Channel Pattern** - Producer-consumer pattern
33. **ValueTask Pattern** - Performance optimization
34. **Span<T> Pattern** - Memory-efficient processing
35. **Record Pattern** - Immutable data
36. **Init-Only Properties** - Immutable initialization
37. **Pattern Matching** - Advanced matching
38. **Extension Everything** - Extension methods
39. **LINQ Provider** - Custom LINQ implementation
40. **Source Generator** - Compile-time code generation

## Quick Pattern Lookup

### By Use Case

#### Web API Development
- Middleware Pipeline (cross-cutting concerns)
- Action Filter (validation, caching)
- Minimal API (lightweight endpoints)
- API Versioning (version management)
- Rate Limiting (throttling)

#### Data Access
- Repository with EF (data abstraction)
- Unit of Work (transactions)
- Specification Pattern (complex queries)
- Soft Delete (logical deletion)
- Audit Trail (change tracking)

#### Background Processing
- Background Service (scheduled tasks)
- Channel Pattern (producer-consumer)
- Queued Hosted Service (task queue)

#### Real-Time Communication
- SignalR Hub (websockets)
- gRPC Service (high-performance RPC)

#### Dependency Management
- Scoped/Singleton/Transient (lifecycles)
- Factory Pattern (object creation)
- Decorator Pattern (enhancement)

#### Performance Optimization
- Response Caching (output cache)
- ValueTask (async performance)
- Span<T> (memory efficiency)
- Async Streams (large datasets)

#### Multi-Tenancy
- Multi-Tenancy (tenant isolation)
- Global Query Filters (automatic filtering)
- DbContext Factory (context management)

#### Modern C# Features
- Record Pattern (immutable data)
- Init-Only Properties (initialization)
- Pattern Matching (advanced matching)
- Async Streams (async iteration)

### By Technology

#### ASP.NET Core 6.0+
Patterns 1-4, 7-17 (ASP.NET Core category)

#### Entity Framework Core 6.0+
Patterns 5, 18-26 (Entity Framework category)

#### Microsoft.Extensions.DependencyInjection
Patterns 27-31 (Dependency Injection category)

#### C# 8.0+ Language Features
Patterns 6, 32-40 (Modern C# category)

## Code Examples

### Running a Pattern
```bash
cd CSharp/DotNetPatterns/AspNetCore/MiddlewarePipeline
dotnet run
```

### Viewing Documentation
Each pattern's README.md contains:
- Intent and motivation
- When to use
- Structure diagram
- Implementation details
- 5+ real-world applications
- 8-10 best practices
- Key takeaways

### Integration Example
```csharp
// Using Middleware Pipeline
app.UseExceptionHandling();
app.UseCorrelationId();
app.UseRequestLogging();

// Using Repository Pattern
services.AddScoped<IProductRepository, ProductRepository>();
services.AddScoped<IUnitOfWork, UnitOfWork>();

// Using Background Service
services.AddHostedService<DataSyncService>();

// Using Async Streams
await foreach (LogEntry log in reader.GetDataAsync())
{
    ProcessLog(log);
}
```

## Implementation Progress

### Completion Status
- **Total Patterns**: 40
- **Completed**: 6 (15%)
- **In Progress**: 0
- **Remaining**: 34 (85%)

### Lines of Code
- **Implementation**: 3,494 lines
- **Documentation**: 2,500+ lines
- **Total**: 6,000+ lines

### Category Breakdown
- ASP.NET Core: 4/15 (27%)
- Entity Framework: 1/10 (10%)
- Dependency Injection: 0/5 (0%)
- Modern C#: 1/10 (10%)

## Getting Started

### For Learners
1. Start with [README.md](README.md) for overview
2. Pick a pattern category that interests you
3. Read the pattern's README.md
4. Study the Program.cs implementation
5. Run the demonstrations
6. Integrate into your projects

### For Contributors
1. Review [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
2. Choose a pattern from [PATTERN_STATUS.md](PATTERN_STATUS.md)
3. Follow the implementation template
4. Create Program.cs (300-600 lines)
5. Write comprehensive README.md
6. Update progress tracking

### For Teams
1. Adopt patterns based on needs
2. Customize for your context
3. Extend with team-specific requirements
4. Use as onboarding material
5. Reference in code reviews

## Resources

### Microsoft Documentation
- [ASP.NET Core](https://docs.microsoft.com/aspnet/core)
- [Entity Framework Core](https://docs.microsoft.com/ef/core)
- [C# Language](https://docs.microsoft.com/dotnet/csharp)
- [Dependency Injection](https://docs.microsoft.com/dotnet/core/extensions/dependency-injection)

### Pattern Resources
- Enterprise Application Architecture (Martin Fowler)
- Domain-Driven Design (Eric Evans)
- Clean Architecture (Robert C. Martin)
- Design Patterns (Gang of Four)

## Support

### Questions?
- Check pattern README.md
- Review IMPLEMENTATION_GUIDE.md
- Consult Microsoft documentation
- Reference completed patterns

### Contributing?
- Follow implementation guide
- Maintain code quality standards
- Write comprehensive documentation
- Add to progress tracking

---

**Quick Links**:
[Main README](README.md) |
[Implementation Guide](IMPLEMENTATION_GUIDE.md) |
[Pattern Status](PATTERN_STATUS.md) |
[Completion Summary](COMPLETION_SUMMARY.md)

**Project Version**: 1.0 (15% complete)
**Last Updated**: October 14, 2024
