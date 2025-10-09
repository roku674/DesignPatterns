using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DesignPatterns.Behavioral.ChainOfResponsibility
{
    // Real Chain of Responsibility pattern implementation
    // Use case: HTTP request processing pipeline with authentication, logging, validation, and caching

    // HTTP Request/Response models
    public class HttpRequest
    {
        public string Method { get; set; }
        public string Path { get; set; }
        public Dictionary<string, string> Headers { get; set; }
        public string Body { get; set; }
        public Dictionary<string, object> Context { get; set; }

        public HttpRequest(string method, string path)
        {
            Method = method ?? throw new ArgumentNullException(nameof(method));
            Path = path ?? throw new ArgumentNullException(nameof(path));
            Headers = new Dictionary<string, string>();
            Context = new Dictionary<string, object>();
        }

        public void AddHeader(string key, string value)
        {
            Headers[key] = value;
        }

        public string GetHeader(string key)
        {
            return Headers.ContainsKey(key) ? Headers[key] : null;
        }
    }

    public class HttpResponse
    {
        public int StatusCode { get; set; }
        public string Body { get; set; }
        public Dictionary<string, string> Headers { get; set; }
        public bool IsHandled { get; set; }

        public HttpResponse()
        {
            Headers = new Dictionary<string, string>();
            IsHandled = false;
        }

        public void AddHeader(string key, string value)
        {
            Headers[key] = value;
        }
    }

    // Base handler interface
    public interface IRequestHandler
    {
        IRequestHandler SetNext(IRequestHandler handler);
        Task<HttpResponse> HandleAsync(HttpRequest request, HttpResponse response);
    }

    // Abstract base handler
    public abstract class RequestHandlerBase : IRequestHandler
    {
        private IRequestHandler _nextHandler;

        public IRequestHandler SetNext(IRequestHandler handler)
        {
            _nextHandler = handler;
            return handler;
        }

        public virtual async Task<HttpResponse> HandleAsync(HttpRequest request, HttpResponse response)
        {
            if (_nextHandler != null && !response.IsHandled)
            {
                return await _nextHandler.HandleAsync(request, response);
            }
            return response;
        }
    }

    // Authentication handler
    public class AuthenticationHandler : RequestHandlerBase
    {
        private readonly Dictionary<string, string> _validTokens;

        public AuthenticationHandler()
        {
            _validTokens = new Dictionary<string, string>
            {
                { "token-123", "user@example.com" },
                { "token-456", "admin@example.com" },
                { "token-789", "developer@example.com" }
            };
        }

        public override async Task<HttpResponse> HandleAsync(HttpRequest request, HttpResponse response)
        {
            Console.WriteLine("[AUTH] Checking authentication...");

            string authHeader = request.GetHeader("Authorization");

            if (string.IsNullOrEmpty(authHeader))
            {
                Console.WriteLine("[AUTH] No authorization header found");
                response.StatusCode = 401;
                response.Body = "Unauthorized: Missing authorization header";
                response.IsHandled = true;
                return response;
            }

            string token = authHeader.Replace("Bearer ", "");

            if (!_validTokens.ContainsKey(token))
            {
                Console.WriteLine($"[AUTH] Invalid token: {token}");
                response.StatusCode = 401;
                response.Body = "Unauthorized: Invalid token";
                response.IsHandled = true;
                return response;
            }

            string userEmail = _validTokens[token];
            request.Context["user"] = userEmail;
            Console.WriteLine($"[AUTH] Authenticated user: {userEmail}");

            return await base.HandleAsync(request, response);
        }
    }

    // Logging handler
    public class LoggingHandler : RequestHandlerBase
    {
        private readonly List<string> _logs;
        private readonly object _lockObject = new object();

        public LoggingHandler()
        {
            _logs = new List<string>();
        }

        public override async Task<HttpResponse> HandleAsync(HttpRequest request, HttpResponse response)
        {
            DateTime startTime = DateTime.UtcNow;
            string logEntry = $"[{startTime:yyyy-MM-dd HH:mm:ss.fff}] {request.Method} {request.Path}";

            Console.WriteLine($"[LOG] {logEntry}");

            HttpResponse result = await base.HandleAsync(request, response);

            DateTime endTime = DateTime.UtcNow;
            TimeSpan duration = endTime - startTime;
            string completionLog = $"[{endTime:yyyy-MM-dd HH:mm:ss.fff}] Completed with status {result.StatusCode} in {duration.TotalMilliseconds:F2}ms";

            Console.WriteLine($"[LOG] {completionLog}");

            lock (_lockObject)
            {
                _logs.Add(logEntry);
                _logs.Add(completionLog);
            }

            return result;
        }

        public List<string> GetLogs()
        {
            lock (_lockObject)
            {
                return new List<string>(_logs);
            }
        }
    }

    // Validation handler
    public class ValidationHandler : RequestHandlerBase
    {
        public override async Task<HttpResponse> HandleAsync(HttpRequest request, HttpResponse response)
        {
            Console.WriteLine("[VALIDATION] Validating request...");

            // Validate method
            string[] allowedMethods = { "GET", "POST", "PUT", "DELETE", "PATCH" };
            if (!allowedMethods.Contains(request.Method.ToUpper()))
            {
                Console.WriteLine($"[VALIDATION] Invalid HTTP method: {request.Method}");
                response.StatusCode = 405;
                response.Body = $"Method not allowed: {request.Method}";
                response.IsHandled = true;
                return response;
            }

            // Validate path
            if (string.IsNullOrWhiteSpace(request.Path) || !request.Path.StartsWith("/"))
            {
                Console.WriteLine($"[VALIDATION] Invalid path: {request.Path}");
                response.StatusCode = 400;
                response.Body = "Bad request: Invalid path";
                response.IsHandled = true;
                return response;
            }

            // Validate POST/PUT/PATCH have body
            if ((request.Method == "POST" || request.Method == "PUT" || request.Method == "PATCH") &&
                string.IsNullOrWhiteSpace(request.Body))
            {
                Console.WriteLine($"[VALIDATION] Missing body for {request.Method} request");
                response.StatusCode = 400;
                response.Body = $"Bad request: {request.Method} requires a body";
                response.IsHandled = true;
                return response;
            }

            Console.WriteLine("[VALIDATION] Request is valid");
            return await base.HandleAsync(request, response);
        }
    }

    // Caching handler
    public class CachingHandler : RequestHandlerBase
    {
        private readonly Dictionary<string, (HttpResponse response, DateTime expiry)> _cache;
        private readonly TimeSpan _cacheDuration;
        private readonly object _lockObject = new object();

        public CachingHandler(TimeSpan cacheDuration)
        {
            _cache = new Dictionary<string, (HttpResponse, DateTime)>();
            _cacheDuration = cacheDuration;
        }

        public override async Task<HttpResponse> HandleAsync(HttpRequest request, HttpResponse response)
        {
            // Only cache GET requests
            if (request.Method != "GET")
            {
                return await base.HandleAsync(request, response);
            }

            string cacheKey = $"{request.Method}:{request.Path}";

            lock (_lockObject)
            {
                if (_cache.ContainsKey(cacheKey))
                {
                    (HttpResponse cachedResponse, DateTime expiry) = _cache[cacheKey];

                    if (DateTime.UtcNow < expiry)
                    {
                        Console.WriteLine($"[CACHE] HIT for {cacheKey}");
                        HttpResponse clonedResponse = CloneResponse(cachedResponse);
                        clonedResponse.AddHeader("X-Cache", "HIT");
                        return clonedResponse;
                    }
                    else
                    {
                        Console.WriteLine($"[CACHE] EXPIRED for {cacheKey}");
                        _cache.Remove(cacheKey);
                    }
                }
            }

            Console.WriteLine($"[CACHE] MISS for {cacheKey}");
            HttpResponse result = await base.HandleAsync(request, response);

            if (result.StatusCode == 200)
            {
                lock (_lockObject)
                {
                    DateTime expiry = DateTime.UtcNow.Add(_cacheDuration);
                    _cache[cacheKey] = (CloneResponse(result), expiry);
                    Console.WriteLine($"[CACHE] Cached response for {cacheKey} until {expiry:HH:mm:ss}");
                }
            }

            result.AddHeader("X-Cache", "MISS");
            return result;
        }

        private HttpResponse CloneResponse(HttpResponse original)
        {
            HttpResponse clone = new HttpResponse
            {
                StatusCode = original.StatusCode,
                Body = original.Body,
                IsHandled = original.IsHandled
            };

            foreach (KeyValuePair<string, string> header in original.Headers)
            {
                clone.Headers[header.Key] = header.Value;
            }

            return clone;
        }

        public int CacheSize
        {
            get
            {
                lock (_lockObject)
                {
                    return _cache.Count;
                }
            }
        }
    }

    // Rate limiting handler
    public class RateLimitingHandler : RequestHandlerBase
    {
        private readonly Dictionary<string, List<DateTime>> _requestHistory;
        private readonly int _maxRequestsPerMinute;
        private readonly object _lockObject = new object();

        public RateLimitingHandler(int maxRequestsPerMinute)
        {
            _requestHistory = new Dictionary<string, List<DateTime>>();
            _maxRequestsPerMinute = maxRequestsPerMinute;
        }

        public override async Task<HttpResponse> HandleAsync(HttpRequest request, HttpResponse response)
        {
            string user = request.Context.ContainsKey("user")
                ? request.Context["user"].ToString()
                : "anonymous";

            Console.WriteLine($"[RATE LIMIT] Checking rate limit for {user}...");

            lock (_lockObject)
            {
                if (!_requestHistory.ContainsKey(user))
                {
                    _requestHistory[user] = new List<DateTime>();
                }

                DateTime now = DateTime.UtcNow;
                DateTime oneMinuteAgo = now.AddMinutes(-1);

                // Remove old requests
                _requestHistory[user] = _requestHistory[user]
                    .Where(time => time > oneMinuteAgo)
                    .ToList();

                if (_requestHistory[user].Count >= _maxRequestsPerMinute)
                {
                    Console.WriteLine($"[RATE LIMIT] Rate limit exceeded for {user}");
                    response.StatusCode = 429;
                    response.Body = "Too many requests. Please try again later.";
                    response.AddHeader("Retry-After", "60");
                    response.IsHandled = true;
                    return response;
                }

                _requestHistory[user].Add(now);
                Console.WriteLine($"[RATE LIMIT] Request allowed ({_requestHistory[user].Count}/{_maxRequestsPerMinute})");
            }

            return await base.HandleAsync(request, response);
        }
    }

    // Final handler that processes the actual request
    public class ApiHandler : RequestHandlerBase
    {
        private readonly Dictionary<string, Func<HttpRequest, HttpResponse>> _routes;

        public ApiHandler()
        {
            _routes = new Dictionary<string, Func<HttpRequest, HttpResponse>>
            {
                { "/api/users", HandleUsers },
                { "/api/products", HandleProducts },
                { "/api/orders", HandleOrders }
            };
        }

        public override async Task<HttpResponse> HandleAsync(HttpRequest request, HttpResponse response)
        {
            Console.WriteLine($"[API] Processing {request.Method} {request.Path}");

            return await Task.Run(() =>
            {
                if (_routes.ContainsKey(request.Path))
                {
                    HttpResponse result = _routes[request.Path](request);
                    result.IsHandled = true;
                    return result;
                }

                response.StatusCode = 404;
                response.Body = $"Not found: {request.Path}";
                response.IsHandled = true;
                return response;
            });
        }

        private HttpResponse HandleUsers(HttpRequest request)
        {
            return new HttpResponse
            {
                StatusCode = 200,
                Body = "{\"users\": [{\"id\": 1, \"name\": \"John Doe\"}, {\"id\": 2, \"name\": \"Jane Smith\"}]}"
            };
        }

        private HttpResponse HandleProducts(HttpRequest request)
        {
            return new HttpResponse
            {
                StatusCode = 200,
                Body = "{\"products\": [{\"id\": 1, \"name\": \"Laptop\"}, {\"id\": 2, \"name\": \"Phone\"}]}"
            };
        }

        private HttpResponse HandleOrders(HttpRequest request)
        {
            return new HttpResponse
            {
                StatusCode = 200,
                Body = "{\"orders\": [{\"id\": 1, \"total\": 299.99}, {\"id\": 2, \"total\": 149.99}]}"
            };
        }
    }

    // Demo program
    public class Program
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== Chain of Responsibility Pattern - HTTP Request Pipeline ===\n");

            try
            {
                // Build the chain
                LoggingHandler logger = new LoggingHandler();
                AuthenticationHandler auth = new AuthenticationHandler();
                ValidationHandler validator = new ValidationHandler();
                RateLimitingHandler rateLimiter = new RateLimitingHandler(5);
                CachingHandler cache = new CachingHandler(TimeSpan.FromSeconds(10));
                ApiHandler api = new ApiHandler();

                logger.SetNext(validator)
                      .SetNext(auth)
                      .SetNext(rateLimiter)
                      .SetNext(cache)
                      .SetNext(api);

                Console.WriteLine("Pipeline: Logging → Validation → Auth → Rate Limit → Cache → API\n");

                // Test successful request
                Console.WriteLine("=== Test 1: Successful Request ===\n");
                HttpRequest request1 = new HttpRequest("GET", "/api/users");
                request1.AddHeader("Authorization", "Bearer token-123");
                HttpResponse response1 = await logger.HandleAsync(request1, new HttpResponse());
                Console.WriteLine($"Status: {response1.StatusCode}, Body: {response1.Body}\n");

                // Test cached request
                Console.WriteLine("=== Test 2: Cached Request ===\n");
                HttpRequest request2 = new HttpRequest("GET", "/api/users");
                request2.AddHeader("Authorization", "Bearer token-123");
                HttpResponse response2 = await logger.HandleAsync(request2, new HttpResponse());
                Console.WriteLine($"Status: {response2.StatusCode}");
                Console.WriteLine($"Cache Header: {(response2.Headers.ContainsKey("X-Cache") ? response2.Headers["X-Cache"] : "None")}\n");

                // Test unauthorized request
                Console.WriteLine("=== Test 3: Unauthorized Request ===\n");
                HttpRequest request3 = new HttpRequest("GET", "/api/products");
                HttpResponse response3 = await logger.HandleAsync(request3, new HttpResponse());
                Console.WriteLine($"Status: {response3.StatusCode}, Body: {response3.Body}\n");

                // Test invalid method
                Console.WriteLine("=== Test 4: Invalid Method ===\n");
                HttpRequest request4 = new HttpRequest("INVALID", "/api/users");
                request4.AddHeader("Authorization", "Bearer token-123");
                HttpResponse response4 = await logger.HandleAsync(request4, new HttpResponse());
                Console.WriteLine($"Status: {response4.StatusCode}, Body: {response4.Body}\n");

                // Test rate limiting
                Console.WriteLine("=== Test 5: Rate Limiting ===\n");
                for (int i = 0; i < 7; i++)
                {
                    HttpRequest requestRL = new HttpRequest("GET", $"/api/orders");
                    requestRL.AddHeader("Authorization", "Bearer token-456");
                    HttpResponse responseRL = await logger.HandleAsync(requestRL, new HttpResponse());
                    Console.WriteLine($"Request {i + 1}: Status {responseRL.StatusCode}");
                }

                Console.WriteLine($"\n=== Statistics ===");
                Console.WriteLine($"Total log entries: {logger.GetLogs().Count}");
                Console.WriteLine($"Cache size: {cache.CacheSize}");

                Console.WriteLine("\n=== Pattern Demonstration Complete ===");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\nERROR: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
            }
        }
    }
}
