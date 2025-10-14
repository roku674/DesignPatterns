using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;

namespace DesignPatterns.DotNet.AspNetCore.ActionFilter
{
    /// <summary>
    /// Action Filter Pattern - Cross-cutting concerns in MVC
    ///
    /// This pattern demonstrates how to use action filters to implement
    /// cross-cutting concerns like validation, logging, caching, and performance
    /// monitoring in ASP.NET Core MVC applications.
    /// </summary>

    // Base attribute for custom action filters
    public abstract class BaseActionFilterAttribute : ActionFilterAttribute
    {
        protected readonly ILogger Logger;

        protected BaseActionFilterAttribute(ILogger logger)
        {
            Logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
    }

    // Validation action filter
    public class ValidateModelAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));

            if (!context.ModelState.IsValid)
            {
                Dictionary<string, List<string>> errors = new Dictionary<string, List<string>>();

                foreach (string key in context.ModelState.Keys)
                {
                    Microsoft.AspNetCore.Mvc.ModelBinding.ModelStateEntry modelState = context.ModelState[key];
                    if (modelState.Errors.Count > 0)
                    {
                        errors[key] = modelState.Errors
                            .Select(e => e.ErrorMessage)
                            .ToList();
                    }
                }

                context.Result = new BadRequestObjectResult(new
                {
                    message = "Validation failed",
                    errors = errors
                });
            }
        }
    }

    // Performance monitoring action filter
    public class PerformanceMonitoringAttribute : ActionFilterAttribute
    {
        private readonly int _warningThresholdMs;
        private const string StopwatchKey = "ActionStopwatch";

        public PerformanceMonitoringAttribute(int warningThresholdMs = 1000)
        {
            _warningThresholdMs = warningThresholdMs;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));

            Stopwatch stopwatch = Stopwatch.StartNew();
            context.HttpContext.Items[StopwatchKey] = stopwatch;
        }

        public override void OnActionExecuted(ActionExecutedContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));

            if (context.HttpContext.Items[StopwatchKey] is Stopwatch stopwatch)
            {
                stopwatch.Stop();

                string actionName = context.ActionDescriptor.DisplayName ?? "Unknown";
                long elapsedMs = stopwatch.ElapsedMilliseconds;

                Console.WriteLine($"Action '{actionName}' completed in {elapsedMs}ms");

                if (elapsedMs > _warningThresholdMs)
                {
                    Console.WriteLine($"WARNING: Slow action detected (threshold: {_warningThresholdMs}ms)");
                }

                context.HttpContext.Response.Headers["X-Action-Time-Ms"] = elapsedMs.ToString();
            }
        }
    }

    // Logging action filter
    public class LogActionAttribute : ActionFilterAttribute
    {
        private readonly string _logLevel;

        public LogActionAttribute(string logLevel = "Information")
        {
            _logLevel = logLevel;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));

            string actionName = context.ActionDescriptor.DisplayName ?? "Unknown";
            string controllerName = context.RouteData.Values["controller"]?.ToString() ?? "Unknown";
            string actionMethod = context.RouteData.Values["action"]?.ToString() ?? "Unknown";

            Console.WriteLine($"[{_logLevel}] Executing action: {controllerName}.{actionMethod}");
            Console.WriteLine($"  Parameters: {string.Join(", ", context.ActionArguments.Select(a => $"{a.Key}={a.Value}"))}");
        }

        public override void OnActionExecuted(ActionExecutedContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));

            string actionName = context.ActionDescriptor.DisplayName ?? "Unknown";
            string resultType = context.Result?.GetType().Name ?? "None";

            Console.WriteLine($"[{_logLevel}] Action completed: Result type = {resultType}");

            if (context.Exception != null)
            {
                Console.WriteLine($"[Error] Exception occurred: {context.Exception.Message}");
            }
        }
    }

    // Caching action filter
    public class CacheResponseAttribute : ActionFilterAttribute
    {
        private readonly int _durationSeconds;
        private static readonly Dictionary<string, CacheEntry> Cache = new Dictionary<string, CacheEntry>();

        public CacheResponseAttribute(int durationSeconds = 60)
        {
            _durationSeconds = durationSeconds;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));

            string cacheKey = GenerateCacheKey(context);

            if (Cache.TryGetValue(cacheKey, out CacheEntry entry))
            {
                if (DateTime.UtcNow < entry.ExpirationTime)
                {
                    Console.WriteLine($"Cache HIT: {cacheKey}");
                    context.Result = entry.Result;
                    context.HttpContext.Response.Headers["X-Cache"] = "HIT";
                }
                else
                {
                    Console.WriteLine($"Cache EXPIRED: {cacheKey}");
                    Cache.Remove(cacheKey);
                    context.HttpContext.Response.Headers["X-Cache"] = "MISS";
                }
            }
            else
            {
                Console.WriteLine($"Cache MISS: {cacheKey}");
                context.HttpContext.Response.Headers["X-Cache"] = "MISS";
            }
        }

        public override void OnActionExecuted(ActionExecutedContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));

            if (context.Result != null && context.Exception == null)
            {
                string cacheKey = GenerateCacheKey(context);

                if (!Cache.ContainsKey(cacheKey))
                {
                    CacheEntry entry = new CacheEntry
                    {
                        Result = context.Result,
                        ExpirationTime = DateTime.UtcNow.AddSeconds(_durationSeconds)
                    };
                    Cache[cacheKey] = entry;
                    Console.WriteLine($"Cached response for {cacheKey} (expires in {_durationSeconds}s)");
                }
            }
        }

        private string GenerateCacheKey(FilterContext context)
        {
            string controller = context.RouteData.Values["controller"]?.ToString() ?? "Unknown";
            string action = context.RouteData.Values["action"]?.ToString() ?? "Unknown";
            string query = context.HttpContext.Request.QueryString.ToString();
            return $"{controller}.{action}{query}";
        }

        private class CacheEntry
        {
            public IActionResult Result { get; set; }
            public DateTime ExpirationTime { get; set; }
        }
    }

    // Authorization action filter
    public class RequireRoleAttribute : ActionFilterAttribute
    {
        private readonly string[] _requiredRoles;

        public RequireRoleAttribute(params string[] requiredRoles)
        {
            _requiredRoles = requiredRoles ?? throw new ArgumentNullException(nameof(requiredRoles));
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));

            // Simulate getting user roles from context
            string[] userRoles = GetUserRoles(context);

            bool hasRequiredRole = _requiredRoles.Any(required =>
                userRoles.Contains(required, StringComparer.OrdinalIgnoreCase));

            if (!hasRequiredRole)
            {
                Console.WriteLine($"Access denied: User doesn't have required roles ({string.Join(", ", _requiredRoles)})");
                context.Result = new ForbidResult();
            }
            else
            {
                Console.WriteLine($"Access granted: User has required role");
            }
        }

        private string[] GetUserRoles(ActionExecutingContext context)
        {
            // In real application, get from ClaimsPrincipal
            // For demo purposes, simulate roles
            if (context.HttpContext.Items.ContainsKey("UserRoles"))
            {
                return context.HttpContext.Items["UserRoles"] as string[] ?? Array.Empty<string>();
            }
            return new[] { "User", "Admin" }; // Default for demo
        }
    }

    // Exception handling action filter
    public class HandleExceptionAttribute : ExceptionFilterAttribute
    {
        public override void OnException(ExceptionContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));

            Console.WriteLine($"Exception caught: {context.Exception.GetType().Name}");
            Console.WriteLine($"Message: {context.Exception.Message}");

            int statusCode = context.Exception switch
            {
                ArgumentException => 400,
                UnauthorizedAccessException => 401,
                KeyNotFoundException => 404,
                InvalidOperationException => 409,
                _ => 500
            };

            ObjectResult result = new ObjectResult(new
            {
                error = context.Exception.Message,
                type = context.Exception.GetType().Name,
                statusCode = statusCode,
                timestamp = DateTime.UtcNow
            })
            {
                StatusCode = statusCode
            };

            context.Result = result;
            context.ExceptionHandled = true;
        }
    }

    // Request throttling action filter
    public class ThrottleAttribute : ActionFilterAttribute
    {
        private readonly int _maxRequests;
        private readonly int _timeWindowSeconds;
        private static readonly Dictionary<string, ThrottleInfo> ThrottleCache = new Dictionary<string, ThrottleInfo>();

        public ThrottleAttribute(int maxRequests = 10, int timeWindowSeconds = 60)
        {
            _maxRequests = maxRequests;
            _timeWindowSeconds = timeWindowSeconds;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));

            string clientId = GetClientIdentifier(context);
            string key = $"{clientId}:{context.ActionDescriptor.DisplayName}";

            if (!ThrottleCache.TryGetValue(key, out ThrottleInfo info))
            {
                info = new ThrottleInfo
                {
                    RequestCount = 0,
                    WindowStart = DateTime.UtcNow
                };
                ThrottleCache[key] = info;
            }

            // Reset window if expired
            if ((DateTime.UtcNow - info.WindowStart).TotalSeconds >= _timeWindowSeconds)
            {
                info.RequestCount = 0;
                info.WindowStart = DateTime.UtcNow;
            }

            info.RequestCount++;

            if (info.RequestCount > _maxRequests)
            {
                TimeSpan retryAfter = TimeSpan.FromSeconds(_timeWindowSeconds) - (DateTime.UtcNow - info.WindowStart);
                Console.WriteLine($"Rate limit exceeded for {clientId}: {info.RequestCount}/{_maxRequests}");

                context.Result = new ContentResult
                {
                    StatusCode = 429, // Too Many Requests
                    Content = $"Rate limit exceeded. Retry after {retryAfter.TotalSeconds:F0} seconds."
                };
                context.HttpContext.Response.Headers["Retry-After"] = retryAfter.TotalSeconds.ToString("F0");
            }
        }

        private string GetClientIdentifier(ActionExecutingContext context)
        {
            // In real application, use IP address or authenticated user ID
            return context.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        }

        private class ThrottleInfo
        {
            public int RequestCount { get; set; }
            public DateTime WindowStart { get; set; }
        }
    }

    // Response transformation action filter
    public class TransformResponseAttribute : ResultFilterAttribute
    {
        public override void OnResultExecuting(ResultExecutingContext context)
        {
            if (context == null) throw new ArgumentNullException(nameof(context));

            if (context.Result is ObjectResult objectResult)
            {
                object transformedResult = new
                {
                    success = true,
                    data = objectResult.Value,
                    timestamp = DateTime.UtcNow,
                    requestId = context.HttpContext.TraceIdentifier
                };

                objectResult.Value = transformedResult;
                Console.WriteLine("Response transformed with metadata");
            }
        }
    }

    // Sample controller using action filters
    [Route("api/[controller]")]
    [HandleException]
    public class ProductsController : ControllerBase
    {
        [HttpGet]
        [CacheResponse(30)]
        [LogAction]
        [PerformanceMonitoring(500)]
        public IActionResult GetAll()
        {
            // Simulate data retrieval
            List<object> products = new List<object>
            {
                new { Id = 1, Name = "Product 1", Price = 29.99 },
                new { Id = 2, Name = "Product 2", Price = 39.99 }
            };

            return Ok(products);
        }

        [HttpGet("{id}")]
        [CacheResponse(60)]
        [LogAction("Debug")]
        public IActionResult GetById(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Invalid product ID");

            object product = new { Id = id, Name = $"Product {id}", Price = 29.99 };
            return Ok(product);
        }

        [HttpPost]
        [ValidateModel]
        [LogAction]
        [RequireRole("Admin", "Manager")]
        [TransformResponse]
        public IActionResult Create([FromBody] ProductModel model)
        {
            if (model == null)
                throw new ArgumentNullException(nameof(model));

            object product = new { Id = 100, Name = model.Name, Price = model.Price };
            return CreatedAtAction(nameof(GetById), new { id = 100 }, product);
        }

        [HttpDelete("{id}")]
        [RequireRole("Admin")]
        [Throttle(5, 60)]
        [LogAction]
        public IActionResult Delete(int id)
        {
            if (id <= 0)
                throw new KeyNotFoundException("Product not found");

            return NoContent();
        }
    }

    public class ProductModel
    {
        public string Name { get; set; }
        public decimal Price { get; set; }
    }

    // Demonstration
    public class Program
    {
        public static void Main(string[] args)
        {
            Console.WriteLine("=== Action Filter Pattern Demo ===\n");

            // Demo 1: Model validation filter
            Console.WriteLine("Demo 1: Model Validation Filter");
            DemoValidationFilter();

            // Demo 2: Performance monitoring filter
            Console.WriteLine("\nDemo 2: Performance Monitoring Filter");
            DemoPerformanceFilter();

            // Demo 3: Logging filter
            Console.WriteLine("\nDemo 3: Logging Filter");
            DemoLoggingFilter();

            // Demo 4: Caching filter
            Console.WriteLine("\nDemo 4: Caching Filter");
            DemoCachingFilter();

            // Demo 5: Exception handling filter
            Console.WriteLine("\nDemo 5: Exception Handling Filter");
            DemoExceptionFilter();

            // Demo 6: Throttling filter
            Console.WriteLine("\nDemo 6: Throttling Filter");
            DemoThrottlingFilter();

            Console.WriteLine("\n=== Action Filter Benefits ===");
            Console.WriteLine("- Cross-cutting concerns separation");
            Console.WriteLine("- Reusable across multiple actions");
            Console.WriteLine("- Clean controller code");
            Console.WriteLine("- Easy to test independently");
            Console.WriteLine("- Configurable per action");
        }

        private static void DemoValidationFilter()
        {
            ValidateModelAttribute filter = new ValidateModelAttribute();
            ActionExecutingContext context = CreateMockActionContext();

            // Add validation error
            context.ModelState.AddModelError("Name", "Name is required");

            filter.OnActionExecuting(context);

            if (context.Result is BadRequestObjectResult badRequest)
            {
                Console.WriteLine("  Validation failed - BadRequest returned");
                Console.WriteLine($"  Result: {System.Text.Json.JsonSerializer.Serialize(badRequest.Value)}");
            }
        }

        private static void DemoPerformanceFilter()
        {
            PerformanceMonitoringAttribute filter = new PerformanceMonitoringAttribute(100);
            ActionExecutingContext executingContext = CreateMockActionContext();
            ActionExecutedContext executedContext = CreateMockActionExecutedContext();

            filter.OnActionExecuting(executingContext);
            System.Threading.Thread.Sleep(150); // Simulate slow action
            filter.OnActionExecuted(executedContext);
        }

        private static void DemoLoggingFilter()
        {
            LogActionAttribute filter = new LogActionAttribute("Information");
            ActionExecutingContext executingContext = CreateMockActionContext();
            executingContext.ActionArguments["id"] = 123;
            executingContext.ActionArguments["name"] = "Test";

            ActionExecutedContext executedContext = CreateMockActionExecutedContext();
            executedContext.Result = new OkResult();

            filter.OnActionExecuting(executingContext);
            filter.OnActionExecuted(executedContext);
        }

        private static void DemoCachingFilter()
        {
            CacheResponseAttribute filter = new CacheResponseAttribute(30);

            // First request - cache miss
            ActionExecutingContext context1 = CreateMockActionContext();
            ActionExecutedContext context1Executed = CreateMockActionExecutedContext();
            context1Executed.Result = new OkObjectResult(new { data = "test" });

            filter.OnActionExecuting(context1);
            filter.OnActionExecuted(context1Executed);

            // Second request - cache hit
            ActionExecutingContext context2 = CreateMockActionContext();
            filter.OnActionExecuting(context2);

            if (context2.Result != null)
            {
                Console.WriteLine("  Second request served from cache");
            }
        }

        private static void DemoExceptionFilter()
        {
            HandleExceptionAttribute filter = new HandleExceptionAttribute();
            ExceptionContext context = CreateMockExceptionContext(new ArgumentException("Invalid input"));

            filter.OnException(context);

            if (context.ExceptionHandled)
            {
                Console.WriteLine("  Exception handled by filter");
                Console.WriteLine($"  Result: {((ObjectResult)context.Result).StatusCode}");
            }
        }

        private static void DemoThrottlingFilter()
        {
            ThrottleAttribute filter = new ThrottleAttribute(3, 60);

            for (int i = 1; i <= 5; i++)
            {
                ActionExecutingContext context = CreateMockActionContext();
                filter.OnActionExecuting(context);

                if (context.Result is ContentResult contentResult && contentResult.StatusCode == 429)
                {
                    Console.WriteLine($"  Request {i}: Rate limit exceeded");
                }
                else
                {
                    Console.WriteLine($"  Request {i}: Allowed");
                }
            }
        }

        private static ActionExecutingContext CreateMockActionContext()
        {
            DefaultHttpContext httpContext = new DefaultHttpContext();
            Microsoft.AspNetCore.Routing.RouteData routeData = new Microsoft.AspNetCore.Routing.RouteData();
            routeData.Values["controller"] = "Products";
            routeData.Values["action"] = "GetAll";

            Microsoft.AspNetCore.Mvc.Abstractions.ActionDescriptor actionDescriptor =
                new Microsoft.AspNetCore.Mvc.Abstractions.ActionDescriptor
                {
                    DisplayName = "ProductsController.GetAll"
                };

            ActionContext actionContext = new ActionContext(httpContext, routeData, actionDescriptor);

            return new ActionExecutingContext(
                actionContext,
                new List<IFilterMetadata>(),
                new Dictionary<string, object>(),
                new ProductsController()
            );
        }

        private static ActionExecutedContext CreateMockActionExecutedContext()
        {
            ActionExecutingContext executingContext = CreateMockActionContext();

            return new ActionExecutedContext(
                executingContext,
                new List<IFilterMetadata>(),
                new ProductsController()
            );
        }

        private static ExceptionContext CreateMockExceptionContext(Exception exception)
        {
            ActionExecutingContext executingContext = CreateMockActionContext();

            return new ExceptionContext(
                executingContext,
                new List<IFilterMetadata>()
            )
            {
                Exception = exception
            };
        }
    }
}
