using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace DesignPatterns.DotNet.AspNetCore.MiddlewarePipeline
{
    /// <summary>
    /// Middleware Pipeline Pattern - Custom middleware components for request/response processing
    ///
    /// This pattern demonstrates how to create custom middleware components that form
    /// a pipeline for processing HTTP requests and responses in ASP.NET Core.
    /// Each middleware can perform operations before and after the next middleware in the pipeline.
    /// </summary>

    // Base interface for custom middleware
    public interface ICustomMiddleware
    {
        Task InvokeAsync(HttpContext context, RequestDelegate next);
    }

    // Request logging middleware
    public class RequestLoggingMiddleware : ICustomMiddleware
    {
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(ILogger<RequestLoggingMiddleware> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));
            if (next == null) throw new ArgumentNullException(nameof(next));

            string requestId = Guid.NewGuid().ToString();
            context.Items["RequestId"] = requestId;

            _logger.LogInformation(
                "Request {RequestId}: {Method} {Path} started at {Time}",
                requestId,
                context.Request.Method,
                context.Request.Path,
                DateTime.UtcNow
            );

            Stopwatch stopwatch = Stopwatch.StartNew();

            try
            {
                await next(context);
            }
            finally
            {
                stopwatch.Stop();
                _logger.LogInformation(
                    "Request {RequestId}: Completed in {ElapsedMs}ms with status {StatusCode}",
                    requestId,
                    stopwatch.ElapsedMilliseconds,
                    context.Response.StatusCode
                );
            }
        }
    }

    // Request timing middleware with performance tracking
    public class PerformanceMonitoringMiddleware : ICustomMiddleware
    {
        private readonly ILogger<PerformanceMonitoringMiddleware> _logger;
        private readonly int _warningThresholdMs;

        public PerformanceMonitoringMiddleware(
            ILogger<PerformanceMonitoringMiddleware> logger,
            int warningThresholdMs = 1000)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _warningThresholdMs = warningThresholdMs;
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));
            if (next == null) throw new ArgumentNullException(nameof(next));

            Stopwatch stopwatch = Stopwatch.StartNew();

            await next(context);

            stopwatch.Stop();

            if (stopwatch.ElapsedMilliseconds > _warningThresholdMs)
            {
                _logger.LogWarning(
                    "Slow request detected: {Method} {Path} took {ElapsedMs}ms (threshold: {ThresholdMs}ms)",
                    context.Request.Method,
                    context.Request.Path,
                    stopwatch.ElapsedMilliseconds,
                    _warningThresholdMs
                );
            }

            context.Response.Headers["X-Response-Time-Ms"] = stopwatch.ElapsedMilliseconds.ToString();
        }
    }

    // Request/Response correlation middleware
    public class CorrelationIdMiddleware : ICustomMiddleware
    {
        private const string CorrelationIdHeader = "X-Correlation-Id";

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));
            if (next == null) throw new ArgumentNullException(nameof(next));

            string correlationId = GetOrCreateCorrelationId(context);
            context.Items["CorrelationId"] = correlationId;

            // Add correlation ID to response headers
            context.Response.OnStarting(() =>
            {
                context.Response.Headers[CorrelationIdHeader] = correlationId;
                return Task.CompletedTask;
            });

            await next(context);
        }

        private string GetOrCreateCorrelationId(HttpContext context)
        {
            if (context.Request.Headers.TryGetValue(CorrelationIdHeader, out Microsoft.Extensions.Primitives.StringValues correlationId))
            {
                return correlationId.FirstOrDefault() ?? Guid.NewGuid().ToString();
            }

            return Guid.NewGuid().ToString();
        }
    }

    // Security headers middleware
    public class SecurityHeadersMiddleware : ICustomMiddleware
    {
        private readonly Dictionary<string, string> _securityHeaders;

        public SecurityHeadersMiddleware()
        {
            _securityHeaders = new Dictionary<string, string>
            {
                { "X-Content-Type-Options", "nosniff" },
                { "X-Frame-Options", "DENY" },
                { "X-XSS-Protection", "1; mode=block" },
                { "Referrer-Policy", "strict-origin-when-cross-origin" },
                { "Content-Security-Policy", "default-src 'self'" }
            };
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));
            if (next == null) throw new ArgumentNullException(nameof(next));

            context.Response.OnStarting(() =>
            {
                foreach (KeyValuePair<string, string> header in _securityHeaders)
                {
                    if (!context.Response.Headers.ContainsKey(header.Key))
                    {
                        context.Response.Headers[header.Key] = header.Value;
                    }
                }
                return Task.CompletedTask;
            });

            await next(context);
        }
    }

    // Request validation middleware
    public class RequestValidationMiddleware : ICustomMiddleware
    {
        private readonly ILogger<RequestValidationMiddleware> _logger;

        public RequestValidationMiddleware(ILogger<RequestValidationMiddleware> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));
            if (next == null) throw new ArgumentNullException(nameof(next));

            // Validate request size
            if (context.Request.ContentLength > 10 * 1024 * 1024) // 10MB
            {
                _logger.LogWarning("Request size exceeds limit: {Size} bytes", context.Request.ContentLength);
                context.Response.StatusCode = 413; // Payload Too Large
                await context.Response.WriteAsync("Request payload too large");
                return;
            }

            // Validate content type for POST/PUT requests
            if ((context.Request.Method == "POST" || context.Request.Method == "PUT")
                && context.Request.ContentLength > 0)
            {
                string contentType = context.Request.ContentType ?? string.Empty;
                if (!IsValidContentType(contentType))
                {
                    _logger.LogWarning("Invalid content type: {ContentType}", contentType);
                    context.Response.StatusCode = 415; // Unsupported Media Type
                    await context.Response.WriteAsync("Unsupported content type");
                    return;
                }
            }

            await next(context);
        }

        private bool IsValidContentType(string contentType)
        {
            string[] validTypes = new[]
            {
                "application/json",
                "application/xml",
                "text/plain",
                "multipart/form-data"
            };

            return validTypes.Any(vt => contentType.Contains(vt, StringComparison.OrdinalIgnoreCase));
        }
    }

    // Exception handling middleware
    public class ExceptionHandlingMiddleware : ICustomMiddleware
    {
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(ILogger<ExceptionHandlingMiddleware> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));
            if (next == null) throw new ArgumentNullException(nameof(next));

            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception occurred");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = exception switch
            {
                ArgumentException => 400,
                UnauthorizedAccessException => 401,
                InvalidOperationException => 409,
                _ => 500
            };

            string response = System.Text.Json.JsonSerializer.Serialize(new
            {
                error = exception.Message,
                statusCode = context.Response.StatusCode,
                timestamp = DateTime.UtcNow
            });

            await context.Response.WriteAsync(response);
        }
    }

    // Middleware pipeline builder
    public class MiddlewarePipelineBuilder
    {
        private readonly List<Func<RequestDelegate, RequestDelegate>> _components;

        public MiddlewarePipelineBuilder()
        {
            _components = new List<Func<RequestDelegate, RequestDelegate>>();
        }

        public MiddlewarePipelineBuilder Use(Func<HttpContext, RequestDelegate, Task> middleware)
        {
            if (middleware == null) throw new ArgumentNullException(nameof(middleware));

            _components.Add(next =>
            {
                return context => middleware(context, next);
            });

            return this;
        }

        public MiddlewarePipelineBuilder UseMiddleware<T>(params object[] args) where T : ICustomMiddleware
        {
            _components.Add(next =>
            {
                return context =>
                {
                    T middleware = (T)ActivatorUtilities.CreateInstance(
                        context.RequestServices,
                        typeof(T),
                        args
                    );
                    return middleware.InvokeAsync(context, next);
                };
            });

            return this;
        }

        public RequestDelegate Build(RequestDelegate finalHandler)
        {
            if (finalHandler == null) throw new ArgumentNullException(nameof(finalHandler));

            RequestDelegate pipeline = finalHandler;

            for (int i = _components.Count - 1; i >= 0; i--)
            {
                pipeline = _components[i](pipeline);
            }

            return pipeline;
        }
    }

    // Extension methods for easy middleware registration
    public static class MiddlewareExtensions
    {
        public static IApplicationBuilder UseRequestLogging(this IApplicationBuilder app)
        {
            return app.UseMiddleware<RequestLoggingMiddleware>();
        }

        public static IApplicationBuilder UsePerformanceMonitoring(
            this IApplicationBuilder app,
            int warningThresholdMs = 1000)
        {
            return app.UseMiddleware<PerformanceMonitoringMiddleware>(warningThresholdMs);
        }

        public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder app)
        {
            return app.UseMiddleware<CorrelationIdMiddleware>();
        }

        public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
        {
            return app.UseMiddleware<SecurityHeadersMiddleware>();
        }

        public static IApplicationBuilder UseRequestValidation(this IApplicationBuilder app)
        {
            return app.UseMiddleware<RequestValidationMiddleware>();
        }

        public static IApplicationBuilder UseExceptionHandling(this IApplicationBuilder app)
        {
            return app.UseMiddleware<ExceptionHandlingMiddleware>();
        }
    }

    // Demonstration
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== Middleware Pipeline Pattern Demo ===\n");

            // Demo 1: Basic middleware pipeline
            Console.WriteLine("Demo 1: Basic Middleware Pipeline");
            DemoBasicPipeline();

            // Demo 2: Custom middleware with logging
            Console.WriteLine("\nDemo 2: Custom Middleware with Logging");
            DemoLoggingMiddleware();

            // Demo 3: Security headers middleware
            Console.WriteLine("\nDemo 3: Security Headers Middleware");
            DemoSecurityMiddleware();

            // Demo 4: Exception handling middleware
            Console.WriteLine("\nDemo 4: Exception Handling Middleware");
            await DemoExceptionMiddleware();

            // Demo 5: Complete pipeline with all middleware
            Console.WriteLine("\nDemo 5: Complete Middleware Pipeline");
            DemoCompletePipeline();
        }

        private static void DemoBasicPipeline()
        {
            MiddlewarePipelineBuilder builder = new MiddlewarePipelineBuilder();

            builder.Use(async (context, next) =>
            {
                Console.WriteLine("  Middleware 1: Before");
                await next(context);
                Console.WriteLine("  Middleware 1: After");
            });

            builder.Use(async (context, next) =>
            {
                Console.WriteLine("  Middleware 2: Before");
                await next(context);
                Console.WriteLine("  Middleware 2: After");
            });

            RequestDelegate pipeline = builder.Build(context =>
            {
                Console.WriteLine("  Final Handler: Processing request");
                return Task.CompletedTask;
            });

            DefaultHttpContext context = new DefaultHttpContext();
            pipeline(context).Wait();
        }

        private static void DemoLoggingMiddleware()
        {
            IServiceCollection services = new ServiceCollection();
            services.AddLogging(builder => builder.AddConsole());
            ServiceProvider serviceProvider = services.BuildServiceProvider();

            ILogger<RequestLoggingMiddleware> logger =
                serviceProvider.GetRequiredService<ILogger<RequestLoggingMiddleware>>();

            RequestLoggingMiddleware middleware = new RequestLoggingMiddleware(logger);

            DefaultHttpContext context = new DefaultHttpContext
            {
                RequestServices = serviceProvider
            };
            context.Request.Method = "GET";
            context.Request.Path = "/api/users";

            middleware.InvokeAsync(context, ctx => Task.CompletedTask).Wait();
        }

        private static void DemoSecurityMiddleware()
        {
            SecurityHeadersMiddleware middleware = new SecurityHeadersMiddleware();

            DefaultHttpContext context = new DefaultHttpContext();

            middleware.InvokeAsync(context, ctx =>
            {
                Console.WriteLine("  Response Headers:");
                foreach (KeyValuePair<string, Microsoft.Extensions.Primitives.StringValues> header in ctx.Response.Headers)
                {
                    Console.WriteLine($"    {header.Key}: {header.Value}");
                }
                return Task.CompletedTask;
            }).Wait();
        }

        private static async Task DemoExceptionMiddleware()
        {
            IServiceCollection services = new ServiceCollection();
            services.AddLogging(builder => builder.AddConsole());
            ServiceProvider serviceProvider = services.BuildServiceProvider();

            ILogger<ExceptionHandlingMiddleware> logger =
                serviceProvider.GetRequiredService<ILogger<ExceptionHandlingMiddleware>>();

            ExceptionHandlingMiddleware middleware = new ExceptionHandlingMiddleware(logger);

            DefaultHttpContext context = new DefaultHttpContext
            {
                RequestServices = serviceProvider
            };

            await middleware.InvokeAsync(context, ctx =>
            {
                throw new ArgumentException("Test exception");
            });

            Console.WriteLine($"  Response Status: {context.Response.StatusCode}");
        }

        private static void DemoCompletePipeline()
        {
            Console.WriteLine("  Pipeline order:");
            Console.WriteLine("    1. Exception Handling");
            Console.WriteLine("    2. Correlation ID");
            Console.WriteLine("    3. Request Logging");
            Console.WriteLine("    4. Performance Monitoring");
            Console.WriteLine("    5. Security Headers");
            Console.WriteLine("    6. Request Validation");
            Console.WriteLine("    7. Final Handler");
            Console.WriteLine("  Middleware executes in order, then unwinds in reverse");
        }
    }
}
