using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Microservices.API.APIGateway;

/// <summary>
/// Implementation of APIGateway pattern.
/// Single entry point for all clients that routes requests to appropriate microservices
/// Handles cross-cutting concerns like authentication, rate limiting, and load balancing
/// </summary>
public class APIGatewayImplementation : IAPIGateway
{
    public void Execute()
    {
        Console.WriteLine("APIGateway pattern executing...");
        Console.WriteLine("Demonstrating comprehensive API Gateway functionality\n");
    }
}

/// <summary>
/// Represents an HTTP request
/// </summary>
public class HttpRequest
{
    public string Method { get; set; }
    public string Path { get; set; }
    public Dictionary<string, string> Headers { get; set; }
    public string Body { get; set; }
    public string ClientId { get; set; }

    public HttpRequest()
    {
        Headers = new Dictionary<string, string>();
    }
}

/// <summary>
/// Represents an HTTP response
/// </summary>
public class HttpResponse
{
    public int StatusCode { get; set; }
    public string Body { get; set; }
    public Dictionary<string, string> Headers { get; set; }
    public TimeSpan ResponseTime { get; set; }

    public HttpResponse()
    {
        Headers = new Dictionary<string, string>();
    }
}

/// <summary>
/// Defines a route mapping from gateway path to backend service
/// </summary>
public class Route
{
    public string Path { get; set; }
    public string ServiceName { get; set; }
    public string TargetPath { get; set; }
    public List<string> AllowedMethods { get; set; }
    public bool RequiresAuthentication { get; set; }

    public Route()
    {
        AllowedMethods = new List<string>();
    }
}

/// <summary>
/// Backend microservice representation
/// </summary>
public interface IBackendService
{
    string ServiceName { get; }
    Task<HttpResponse> HandleRequestAsync(HttpRequest request);
    bool IsHealthy();
}

/// <summary>
/// User service implementation
/// </summary>
public class UserService : IBackendService
{
    public string ServiceName => "UserService";
    private Dictionary<string, string> users = new Dictionary<string, string>
    {
        { "1", "John Doe" },
        { "2", "Jane Smith" },
        { "3", "Bob Johnson" }
    };

    public async Task<HttpResponse> HandleRequestAsync(HttpRequest request)
    {
        await Task.Delay(50); // Simulate processing time

        if (request.Method == "GET" && request.Path.StartsWith("/users/"))
        {
            string userId = request.Path.Split('/').Last();
            if (users.TryGetValue(userId, out string userName))
            {
                return new HttpResponse
                {
                    StatusCode = 200,
                    Body = $"{{\"id\": \"{userId}\", \"name\": \"{userName}\"}}",
                    ResponseTime = TimeSpan.FromMilliseconds(50)
                };
            }
            return new HttpResponse { StatusCode = 404, Body = "User not found" };
        }
        else if (request.Method == "GET" && request.Path == "/users")
        {
            string usersJson = string.Join(", ", users.Select(u => $"{{\"id\": \"{u.Key}\", \"name\": \"{u.Value}\"}}"));
            return new HttpResponse
            {
                StatusCode = 200,
                Body = $"[{usersJson}]",
                ResponseTime = TimeSpan.FromMilliseconds(50)
            };
        }

        return new HttpResponse { StatusCode = 400, Body = "Invalid request" };
    }

    public bool IsHealthy() => true;
}

/// <summary>
/// Order service implementation
/// </summary>
public class OrderService : IBackendService
{
    public string ServiceName => "OrderService";
    private Dictionary<string, string> orders = new Dictionary<string, string>
    {
        { "101", "Order for Product A" },
        { "102", "Order for Product B" }
    };

    public async Task<HttpResponse> HandleRequestAsync(HttpRequest request)
    {
        await Task.Delay(75); // Simulate processing time

        if (request.Method == "GET" && request.Path.StartsWith("/orders/"))
        {
            string orderId = request.Path.Split('/').Last();
            if (orders.TryGetValue(orderId, out string orderDetails))
            {
                return new HttpResponse
                {
                    StatusCode = 200,
                    Body = $"{{\"id\": \"{orderId}\", \"details\": \"{orderDetails}\"}}",
                    ResponseTime = TimeSpan.FromMilliseconds(75)
                };
            }
            return new HttpResponse { StatusCode = 404, Body = "Order not found" };
        }

        return new HttpResponse { StatusCode = 400, Body = "Invalid request" };
    }

    public bool IsHealthy() => true;
}

/// <summary>
/// Product catalog service implementation
/// </summary>
public class ProductService : IBackendService
{
    public string ServiceName => "ProductService";

    public async Task<HttpResponse> HandleRequestAsync(HttpRequest request)
    {
        await Task.Delay(100); // Simulate processing time

        if (request.Method == "GET" && request.Path == "/products")
        {
            return new HttpResponse
            {
                StatusCode = 200,
                Body = "[{\"id\": \"1\", \"name\": \"Laptop\"}, {\"id\": \"2\", \"name\": \"Phone\"}]",
                ResponseTime = TimeSpan.FromMilliseconds(100)
            };
        }

        return new HttpResponse { StatusCode = 400, Body = "Invalid request" };
    }

    public bool IsHealthy() => true;
}

/// <summary>
/// Authentication manager for validating tokens
/// </summary>
public class AuthenticationManager
{
    private HashSet<string> validTokens = new HashSet<string>
    {
        "token-abc123",
        "token-def456",
        "token-ghi789"
    };

    public bool ValidateToken(string token)
    {
        return !string.IsNullOrEmpty(token) && validTokens.Contains(token);
    }

    public string ExtractClientId(string token)
    {
        // Simulate extracting client ID from token
        return token?.Replace("token-", "client-") ?? "anonymous";
    }
}

/// <summary>
/// Rate limiter to prevent API abuse
/// </summary>
public class RateLimiter
{
    private Dictionary<string, RateLimitInfo> clientLimits = new Dictionary<string, RateLimitInfo>();
    private int requestsPerMinute = 10;

    private class RateLimitInfo
    {
        public int RequestCount { get; set; }
        public DateTime WindowStart { get; set; }
    }

    public bool AllowRequest(string clientId)
    {
        if (!clientLimits.ContainsKey(clientId))
        {
            clientLimits[clientId] = new RateLimitInfo
            {
                RequestCount = 1,
                WindowStart = DateTime.UtcNow
            };
            return true;
        }

        RateLimitInfo info = clientLimits[clientId];
        DateTime now = DateTime.UtcNow;

        // Reset window if more than 1 minute has passed
        if ((now - info.WindowStart).TotalMinutes >= 1)
        {
            info.RequestCount = 1;
            info.WindowStart = now;
            return true;
        }

        // Check if limit exceeded
        if (info.RequestCount >= requestsPerMinute)
        {
            return false;
        }

        info.RequestCount++;
        return true;
    }

    public int GetRemainingRequests(string clientId)
    {
        if (!clientLimits.ContainsKey(clientId))
        {
            return requestsPerMinute;
        }

        RateLimitInfo info = clientLimits[clientId];
        DateTime now = DateTime.UtcNow;

        if ((now - info.WindowStart).TotalMinutes >= 1)
        {
            return requestsPerMinute;
        }

        return Math.Max(0, requestsPerMinute - info.RequestCount);
    }
}

/// <summary>
/// Load balancer for distributing requests across service instances
/// </summary>
public class LoadBalancer
{
    private Dictionary<string, int> roundRobinCounters = new Dictionary<string, int>();

    public IBackendService SelectInstance(string serviceName, List<IBackendService> instances)
    {
        if (instances == null || instances.Count == 0)
        {
            return null;
        }

        // Filter healthy instances
        List<IBackendService> healthyInstances = instances.Where(i => i.IsHealthy()).ToList();
        if (healthyInstances.Count == 0)
        {
            return null;
        }

        // Round-robin selection
        if (!roundRobinCounters.ContainsKey(serviceName))
        {
            roundRobinCounters[serviceName] = 0;
        }

        int index = roundRobinCounters[serviceName] % healthyInstances.Count;
        roundRobinCounters[serviceName]++;

        return healthyInstances[index];
    }
}

/// <summary>
/// Main API Gateway that coordinates all components
/// </summary>
public class APIGateway
{
    private Dictionary<string, Route> routes;
    private Dictionary<string, List<IBackendService>> serviceRegistry;
    private AuthenticationManager authManager;
    private RateLimiter rateLimiter;
    private LoadBalancer loadBalancer;
    private List<string> requestLog;

    public APIGateway()
    {
        routes = new Dictionary<string, Route>();
        serviceRegistry = new Dictionary<string, List<IBackendService>>();
        authManager = new AuthenticationManager();
        rateLimiter = new RateLimiter();
        loadBalancer = new LoadBalancer();
        requestLog = new List<string>();
        InitializeRoutes();
        RegisterServices();
    }

    private void InitializeRoutes()
    {
        routes.Add("/api/users", new Route
        {
            Path = "/api/users",
            ServiceName = "UserService",
            TargetPath = "/users",
            AllowedMethods = new List<string> { "GET", "POST" },
            RequiresAuthentication = true
        });

        routes.Add("/api/users/", new Route
        {
            Path = "/api/users/",
            ServiceName = "UserService",
            TargetPath = "/users/",
            AllowedMethods = new List<string> { "GET", "PUT", "DELETE" },
            RequiresAuthentication = true
        });

        routes.Add("/api/orders", new Route
        {
            Path = "/api/orders",
            ServiceName = "OrderService",
            TargetPath = "/orders",
            AllowedMethods = new List<string> { "GET", "POST" },
            RequiresAuthentication = true
        });

        routes.Add("/api/orders/", new Route
        {
            Path = "/api/orders/",
            ServiceName = "OrderService",
            TargetPath = "/orders/",
            AllowedMethods = new List<string> { "GET" },
            RequiresAuthentication = true
        });

        routes.Add("/api/products", new Route
        {
            Path = "/api/products",
            ServiceName = "ProductService",
            TargetPath = "/products",
            AllowedMethods = new List<string> { "GET" },
            RequiresAuthentication = false
        });
    }

    private void RegisterServices()
    {
        // Register multiple instances for load balancing
        serviceRegistry["UserService"] = new List<IBackendService>
        {
            new UserService(),
            new UserService()
        };

        serviceRegistry["OrderService"] = new List<IBackendService>
        {
            new OrderService()
        };

        serviceRegistry["ProductService"] = new List<IBackendService>
        {
            new ProductService()
        };
    }

    public async Task<HttpResponse> HandleRequestAsync(HttpRequest request)
    {
        DateTime startTime = DateTime.UtcNow;

        // 1. Find matching route
        Route route = FindRoute(request.Path);
        if (route == null)
        {
            return new HttpResponse
            {
                StatusCode = 404,
                Body = "Route not found",
                ResponseTime = DateTime.UtcNow - startTime
            };
        }

        // 2. Validate HTTP method
        if (!route.AllowedMethods.Contains(request.Method))
        {
            return new HttpResponse
            {
                StatusCode = 405,
                Body = "Method not allowed",
                ResponseTime = DateTime.UtcNow - startTime
            };
        }

        // 3. Authentication check
        if (route.RequiresAuthentication)
        {
            if (!request.Headers.TryGetValue("Authorization", out string authHeader))
            {
                return new HttpResponse
                {
                    StatusCode = 401,
                    Body = "Authentication required",
                    ResponseTime = DateTime.UtcNow - startTime
                };
            }

            if (!authManager.ValidateToken(authHeader))
            {
                return new HttpResponse
                {
                    StatusCode = 403,
                    Body = "Invalid token",
                    ResponseTime = DateTime.UtcNow - startTime
                };
            }

            request.ClientId = authManager.ExtractClientId(authHeader);
        }
        else
        {
            request.ClientId = "anonymous";
        }

        // 4. Rate limiting check
        if (!rateLimiter.AllowRequest(request.ClientId))
        {
            return new HttpResponse
            {
                StatusCode = 429,
                Body = "Rate limit exceeded",
                ResponseTime = DateTime.UtcNow - startTime
            };
        }

        // 5. Load balancing - select service instance
        List<IBackendService> instances = serviceRegistry[route.ServiceName];
        IBackendService service = loadBalancer.SelectInstance(route.ServiceName, instances);

        if (service == null)
        {
            return new HttpResponse
            {
                StatusCode = 503,
                Body = "Service unavailable",
                ResponseTime = DateTime.UtcNow - startTime
            };
        }

        // 6. Transform request path
        HttpRequest backendRequest = new HttpRequest
        {
            Method = request.Method,
            Path = request.Path.Replace("/api", ""),
            Headers = request.Headers,
            Body = request.Body,
            ClientId = request.ClientId
        };

        // 7. Forward request to backend service
        HttpResponse response = await service.HandleRequestAsync(backendRequest);
        response.ResponseTime = DateTime.UtcNow - startTime;

        // 8. Add gateway headers
        response.Headers["X-Gateway"] = "APIGateway";
        response.Headers["X-RateLimit-Remaining"] = rateLimiter.GetRemainingRequests(request.ClientId).ToString();

        // 9. Log request
        LogRequest(request, response);

        return response;
    }

    private Route FindRoute(string path)
    {
        // Exact match first
        if (routes.TryGetValue(path, out Route route))
        {
            return route;
        }

        // Pattern match for paths with parameters
        foreach (KeyValuePair<string, Route> entry in routes)
        {
            if (entry.Key.EndsWith("/") && path.StartsWith(entry.Key.TrimEnd('/')))
            {
                return entry.Value;
            }
        }

        return null;
    }

    private void LogRequest(HttpRequest request, HttpResponse response)
    {
        string logEntry = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] " +
                         $"{request.ClientId} {request.Method} {request.Path} " +
                         $"-> {response.StatusCode} ({response.ResponseTime.TotalMilliseconds}ms)";
        requestLog.Add(logEntry);
    }

    public List<string> GetRequestLog()
    {
        return new List<string>(requestLog);
    }

    public Dictionary<string, object> GetGatewayStats()
    {
        return new Dictionary<string, object>
        {
            { "TotalRequests", requestLog.Count },
            { "RegisteredRoutes", routes.Count },
            { "RegisteredServices", serviceRegistry.Count }
        };
    }
}
