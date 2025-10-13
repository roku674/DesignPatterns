using System;
using System.Collections.Generic;
using System.Linq;

namespace Concurrency.Interceptor;

/// <summary>
/// Context that gets passed through the interceptor chain
/// Contains request/response data that can be modified by interceptors
/// </summary>
public class InterceptorContext
{
    public string MethodName { get; set; }
    public object[] Arguments { get; set; }
    public object Result { get; set; }
    public Dictionary<string, object> Metadata { get; }
    public bool IsSuccess { get; set; }
    public string ErrorMessage { get; set; }

    public InterceptorContext(string methodName, object[] arguments)
    {
        MethodName = methodName;
        Arguments = arguments;
        Metadata = new Dictionary<string, object>();
        IsSuccess = true;
    }
}

/// <summary>
/// Base interface for all interceptors in the chain
/// </summary>
public interface IChainInterceptor
{
    void PreProcess(InterceptorContext context);
    void PostProcess(InterceptorContext context);
}

/// <summary>
/// Logging interceptor that logs method calls before and after execution
/// </summary>
public class LoggingInterceptor : IChainInterceptor
{
    private readonly string _name;

    public LoggingInterceptor(string name)
    {
        _name = name;
    }

    public void PreProcess(InterceptorContext context)
    {
        Console.WriteLine($"[{_name}] PRE: Calling {context.MethodName}");
        Console.WriteLine($"[{_name}] PRE: Arguments: [{string.Join(", ", context.Arguments)}]");
        context.Metadata["StartTime"] = DateTime.Now;
    }

    public void PostProcess(InterceptorContext context)
    {
        DateTime startTime = (DateTime)context.Metadata["StartTime"];
        TimeSpan elapsed = DateTime.Now - startTime;

        Console.WriteLine($"[{_name}] POST: Method {context.MethodName} completed");
        Console.WriteLine($"[{_name}] POST: Elapsed time: {elapsed.TotalMilliseconds}ms");
        Console.WriteLine($"[{_name}] POST: Result: {context.Result}");
        Console.WriteLine($"[{_name}] POST: Success: {context.IsSuccess}");
    }
}

/// <summary>
/// Validation interceptor that validates input parameters
/// </summary>
public class ValidationInterceptor : IChainInterceptor
{
    public void PreProcess(InterceptorContext context)
    {
        Console.WriteLine("[Validation] PRE: Validating input parameters...");

        if (context.Arguments == null || context.Arguments.Length == 0)
        {
            context.IsSuccess = false;
            context.ErrorMessage = "No arguments provided";
            Console.WriteLine("[Validation] PRE: Validation FAILED - No arguments");
            return;
        }

        foreach (object arg in context.Arguments)
        {
            if (arg == null)
            {
                context.IsSuccess = false;
                context.ErrorMessage = "Null argument detected";
                Console.WriteLine("[Validation] PRE: Validation FAILED - Null argument");
                return;
            }

            if (arg is string stringArg && string.IsNullOrWhiteSpace(stringArg))
            {
                context.IsSuccess = false;
                context.ErrorMessage = "Empty string argument detected";
                Console.WriteLine("[Validation] PRE: Validation FAILED - Empty string");
                return;
            }

            if (arg is int intArg && intArg < 0)
            {
                context.IsSuccess = false;
                context.ErrorMessage = "Negative number argument detected";
                Console.WriteLine("[Validation] PRE: Validation FAILED - Negative number");
                return;
            }
        }

        Console.WriteLine("[Validation] PRE: Validation PASSED");
    }

    public void PostProcess(InterceptorContext context)
    {
        Console.WriteLine("[Validation] POST: Validating result...");

        if (context.Result == null)
        {
            Console.WriteLine("[Validation] POST: Warning - Result is null");
        }
        else
        {
            Console.WriteLine("[Validation] POST: Result validation passed");
        }
    }
}

/// <summary>
/// Security interceptor that checks authorization
/// </summary>
public class SecurityInterceptor : IChainInterceptor
{
    private readonly List<string> _authorizedMethods;

    public SecurityInterceptor(List<string> authorizedMethods)
    {
        _authorizedMethods = authorizedMethods;
    }

    public void PreProcess(InterceptorContext context)
    {
        Console.WriteLine("[Security] PRE: Checking authorization...");

        if (!_authorizedMethods.Contains(context.MethodName))
        {
            context.IsSuccess = false;
            context.ErrorMessage = $"Method {context.MethodName} is not authorized";
            Console.WriteLine($"[Security] PRE: UNAUTHORIZED - {context.MethodName}");
            return;
        }

        Console.WriteLine($"[Security] PRE: AUTHORIZED - {context.MethodName}");
    }

    public void PostProcess(InterceptorContext context)
    {
        Console.WriteLine("[Security] POST: Security check complete");
    }
}

/// <summary>
/// Cache interceptor that can cache results
/// </summary>
public class CacheInterceptor : IChainInterceptor
{
    private readonly Dictionary<string, object> _cache;

    public CacheInterceptor()
    {
        _cache = new Dictionary<string, object>();
    }

    public void PreProcess(InterceptorContext context)
    {
        string cacheKey = GenerateCacheKey(context);
        Console.WriteLine($"[Cache] PRE: Checking cache for key: {cacheKey}");

        if (_cache.ContainsKey(cacheKey))
        {
            context.Result = _cache[cacheKey];
            context.Metadata["CacheHit"] = true;
            Console.WriteLine("[Cache] PRE: CACHE HIT - Using cached result");
        }
        else
        {
            context.Metadata["CacheHit"] = false;
            Console.WriteLine("[Cache] PRE: CACHE MISS - Will execute method");
        }
    }

    public void PostProcess(InterceptorContext context)
    {
        if (context.Metadata.ContainsKey("CacheHit") && !(bool)context.Metadata["CacheHit"])
        {
            string cacheKey = GenerateCacheKey(context);
            _cache[cacheKey] = context.Result;
            Console.WriteLine($"[Cache] POST: Cached result for key: {cacheKey}");
        }
        else
        {
            Console.WriteLine("[Cache] POST: Using cached result, no update needed");
        }
    }

    private string GenerateCacheKey(InterceptorContext context)
    {
        return $"{context.MethodName}_{string.Join("_", context.Arguments)}";
    }
}

/// <summary>
/// Interceptor chain that manages multiple interceptors
/// </summary>
public class InterceptorChain
{
    private readonly List<IChainInterceptor> _interceptors;

    public InterceptorChain()
    {
        _interceptors = new List<IChainInterceptor>();
    }

    /// <summary>
    /// Register a new interceptor dynamically
    /// </summary>
    public void Register(IChainInterceptor interceptor)
    {
        _interceptors.Add(interceptor);
        Console.WriteLine($"Registered interceptor: {interceptor.GetType().Name}");
    }

    /// <summary>
    /// Remove an interceptor from the chain
    /// </summary>
    public void Unregister(IChainInterceptor interceptor)
    {
        _interceptors.Remove(interceptor);
        Console.WriteLine($"Unregistered interceptor: {interceptor.GetType().Name}");
    }

    /// <summary>
    /// Execute the interceptor chain around a target operation
    /// </summary>
    public object Execute(string methodName, object[] arguments, Func<object[], object> targetMethod)
    {
        InterceptorContext context = new InterceptorContext(methodName, arguments);

        // Pre-processing phase - execute all interceptors
        Console.WriteLine("\n--- PRE-PROCESSING PHASE ---");
        foreach (IChainInterceptor interceptor in _interceptors)
        {
            interceptor.PreProcess(context);

            // If any interceptor marks the operation as failed, stop execution
            if (!context.IsSuccess)
            {
                Console.WriteLine($"\nInterceptor chain aborted: {context.ErrorMessage}");
                return null;
            }

            // If cache hit, skip execution
            if (context.Metadata.ContainsKey("CacheHit") && (bool)context.Metadata["CacheHit"])
            {
                Console.WriteLine("\nCache hit - skipping method execution");
                break;
            }
        }

        // Execute the target method if not cached and validation passed
        if (!context.Metadata.ContainsKey("CacheHit") || !(bool)context.Metadata["CacheHit"])
        {
            if (context.IsSuccess)
            {
                Console.WriteLine("\n--- EXECUTING TARGET METHOD ---");
                try
                {
                    context.Result = targetMethod(arguments);
                    Console.WriteLine($"Target method executed successfully");
                }
                catch (Exception ex)
                {
                    context.IsSuccess = false;
                    context.ErrorMessage = ex.Message;
                    Console.WriteLine($"Target method failed: {ex.Message}");
                }
            }
        }

        // Post-processing phase - execute all interceptors in reverse order
        Console.WriteLine("\n--- POST-PROCESSING PHASE ---");
        for (int i = _interceptors.Count - 1; i >= 0; i--)
        {
            _interceptors[i].PostProcess(context);
        }

        return context.Result;
    }

    /// <summary>
    /// Get the count of registered interceptors
    /// </summary>
    public int Count
    {
        get { return _interceptors.Count; }
    }
}

/// <summary>
/// Sample service that will be intercepted
/// </summary>
public class BusinessService
{
    public object ProcessOrder(object[] args)
    {
        string orderId = (string)args[0];
        int quantity = (int)args[1];

        Console.WriteLine($"Processing order {orderId} with quantity {quantity}");

        // Simulate some business logic
        decimal total = quantity * 29.99m;

        return $"Order {orderId} processed: ${total:F2}";
    }

    public object CalculateDiscount(object[] args)
    {
        int purchaseAmount = (int)args[0];

        Console.WriteLine($"Calculating discount for purchase amount: ${purchaseAmount}");

        // Simulate discount calculation
        decimal discount = purchaseAmount > 100 ? purchaseAmount * 0.1m : 0m;

        return $"Discount: ${discount:F2}";
    }
}

/// <summary>
/// Concrete implementation of Interceptor pattern.
/// Allows transparently adding services to framework
/// </summary>
public class InterceptorImplementation : IInterceptor
{
    public void Execute()
    {
        Console.WriteLine("Interceptor pattern executing...");
        Console.WriteLine("Demonstrates transparent service addition through interceptor chains\n");

        // Create the business service
        BusinessService service = new BusinessService();

        // Create interceptor chain
        InterceptorChain chain = new InterceptorChain();

        Console.WriteLine("=== Demonstrating Dynamic Interceptor Registration ===\n");

        // Register interceptors dynamically
        LoggingInterceptor logger = new LoggingInterceptor("Logger");
        ValidationInterceptor validator = new ValidationInterceptor();
        SecurityInterceptor security = new SecurityInterceptor(new List<string> { "ProcessOrder", "CalculateDiscount" });
        CacheInterceptor cache = new CacheInterceptor();

        chain.Register(logger);
        chain.Register(validator);
        chain.Register(security);
        chain.Register(cache);

        Console.WriteLine($"\nTotal interceptors registered: {chain.Count}\n");

        // Example 1: Successful execution with all interceptors
        Console.WriteLine("\n====================================");
        Console.WriteLine("Example 1: Valid Order Processing");
        Console.WriteLine("====================================");
        object result1 = chain.Execute("ProcessOrder", new object[] { "ORD-001", 5 }, service.ProcessOrder);
        Console.WriteLine($"\nFinal Result: {result1}");

        // Example 2: Cached execution (second call with same parameters)
        Console.WriteLine("\n\n====================================");
        Console.WriteLine("Example 2: Cached Order Processing");
        Console.WriteLine("====================================");
        object result2 = chain.Execute("ProcessOrder", new object[] { "ORD-001", 5 }, service.ProcessOrder);
        Console.WriteLine($"\nFinal Result: {result2}");

        // Example 3: Validation failure
        Console.WriteLine("\n\n====================================");
        Console.WriteLine("Example 3: Validation Failure (negative quantity)");
        Console.WriteLine("====================================");
        object result3 = chain.Execute("ProcessOrder", new object[] { "ORD-002", -3 }, service.ProcessOrder);
        Console.WriteLine($"\nFinal Result: {result3 ?? "null (failed validation)"}");

        // Example 4: Authorization failure
        Console.WriteLine("\n\n====================================");
        Console.WriteLine("Example 4: Authorization Failure");
        Console.WriteLine("====================================");
        object result4 = chain.Execute("DeleteOrder", new object[] { "ORD-003" }, args => "Deleted");
        Console.WriteLine($"\nFinal Result: {result4 ?? "null (not authorized)"}");

        // Example 5: Different method call
        Console.WriteLine("\n\n====================================");
        Console.WriteLine("Example 5: Calculate Discount");
        Console.WriteLine("====================================");
        object result5 = chain.Execute("CalculateDiscount", new object[] { 150 }, service.CalculateDiscount);
        Console.WriteLine($"\nFinal Result: {result5}");

        // Example 6: Dynamic unregistration
        Console.WriteLine("\n\n====================================");
        Console.WriteLine("Example 6: Dynamic Unregistration");
        Console.WriteLine("====================================");
        Console.WriteLine("\nUnregistering cache interceptor...");
        chain.Unregister(cache);
        Console.WriteLine($"Remaining interceptors: {chain.Count}\n");

        object result6 = chain.Execute("ProcessOrder", new object[] { "ORD-001", 5 }, service.ProcessOrder);
        Console.WriteLine($"\nFinal Result: {result6}");

        Console.WriteLine("\n\n=== Key Benefits Demonstrated ===");
        Console.WriteLine("1. Transparent service addition - interceptors added without modifying business logic");
        Console.WriteLine("2. Pre/post processing - logic executed before and after method calls");
        Console.WriteLine("3. Dynamic registration - interceptors added/removed at runtime");
        Console.WriteLine("4. Chain of responsibility - multiple interceptors process in sequence");
        Console.WriteLine("5. Cross-cutting concerns - logging, validation, security, caching");
        Console.WriteLine("6. Fail-fast behavior - chain stops on validation/authorization failures");
    }
}
