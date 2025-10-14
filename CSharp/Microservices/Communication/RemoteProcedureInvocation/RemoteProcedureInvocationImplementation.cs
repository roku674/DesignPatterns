using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Microservices.Communication.RemoteProcedureInvocation;

/// <summary>
/// Implementation of Remote Procedure Invocation pattern using gRPC-style communication.
/// Demonstrates synchronous and asynchronous RPC calls between services.
/// </summary>
public class RemoteProcedureInvocationImplementation : IRemoteProcedureInvocation
{
    public void Execute()
    {
        Console.WriteLine("RemoteProcedureInvocation pattern executing...");
        Console.WriteLine("This pattern enables services to invoke methods on remote services as if they were local.");
    }
}

// RPC Protocol - Defines how remote calls are structured
public enum RpcProtocol
{
    HTTP,
    GRPC,
    TCP,
    UDP
}

// RPC Request - Contains method name, parameters, and metadata
public class RpcRequest
{
    public string ServiceName { get; set; } = string.Empty;
    public string MethodName { get; set; } = string.Empty;
    public Dictionary<string, object> Parameters { get; set; } = new Dictionary<string, object>();
    public string RequestId { get; set; } = Guid.NewGuid().ToString();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public RpcProtocol Protocol { get; set; } = RpcProtocol.GRPC;
    public int TimeoutMs { get; set; } = 30000;
}

// RPC Response - Contains result, status, and metadata
public class RpcResponse
{
    public string RequestId { get; set; } = string.Empty;
    public bool Success { get; set; }
    public object? Result { get; set; }
    public string ErrorMessage { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public DateTime ResponseTime { get; set; } = DateTime.UtcNow;
    public long ExecutionTimeMs { get; set; }
}

// RPC Service Registry - Tracks available services and their endpoints
public class RpcServiceRegistry
{
    private readonly Dictionary<string, ServiceEndpoint> _services = new Dictionary<string, ServiceEndpoint>();

    public void RegisterService(string serviceName, string host, int port, RpcProtocol protocol)
    {
        ServiceEndpoint endpoint = new ServiceEndpoint
        {
            ServiceName = serviceName,
            Host = host,
            Port = port,
            Protocol = protocol,
            Status = ServiceStatus.Healthy,
            RegisteredAt = DateTime.UtcNow
        };

        _services[serviceName] = endpoint;
        Console.WriteLine($"[Registry] Service '{serviceName}' registered at {host}:{port} using {protocol}");
    }

    public ServiceEndpoint? GetService(string serviceName)
    {
        return _services.ContainsKey(serviceName) ? _services[serviceName] : null;
    }

    public List<ServiceEndpoint> GetAllServices()
    {
        return new List<ServiceEndpoint>(_services.Values);
    }

    public void UnregisterService(string serviceName)
    {
        if (_services.Remove(serviceName))
        {
            Console.WriteLine($"[Registry] Service '{serviceName}' unregistered");
        }
    }
}

public class ServiceEndpoint
{
    public string ServiceName { get; set; } = string.Empty;
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; }
    public RpcProtocol Protocol { get; set; }
    public ServiceStatus Status { get; set; }
    public DateTime RegisteredAt { get; set; }
}

public enum ServiceStatus
{
    Healthy,
    Degraded,
    Unhealthy,
    Unknown
}

// RPC Client - Initiates remote procedure calls
public class RpcClient
{
    private readonly RpcServiceRegistry _registry;
    private readonly Dictionary<string, int> _requestCounts = new Dictionary<string, int>();

    public RpcClient(RpcServiceRegistry registry)
    {
        _registry = registry;
    }

    public async Task<RpcResponse> CallAsync(RpcRequest request)
    {
        DateTime startTime = DateTime.UtcNow;

        // Track request count
        if (!_requestCounts.ContainsKey(request.ServiceName))
        {
            _requestCounts[request.ServiceName] = 0;
        }
        _requestCounts[request.ServiceName]++;

        Console.WriteLine($"\n[RPC Client] Calling {request.ServiceName}.{request.MethodName}() [RequestId: {request.RequestId}]");
        Console.WriteLine($"   Protocol: {request.Protocol}, Parameters: {string.Join(", ", request.Parameters.Keys)}");

        // Lookup service in registry
        ServiceEndpoint? endpoint = _registry.GetService(request.ServiceName);
        if (endpoint == null)
        {
            return new RpcResponse
            {
                RequestId = request.RequestId,
                Success = false,
                StatusCode = 404,
                ErrorMessage = $"Service '{request.ServiceName}' not found in registry",
                ExecutionTimeMs = (long)(DateTime.UtcNow - startTime).TotalMilliseconds
            };
        }

        if (endpoint.Status != ServiceStatus.Healthy)
        {
            return new RpcResponse
            {
                RequestId = request.RequestId,
                Success = false,
                StatusCode = 503,
                ErrorMessage = $"Service '{request.ServiceName}' is {endpoint.Status}",
                ExecutionTimeMs = (long)(DateTime.UtcNow - startTime).TotalMilliseconds
            };
        }

        // Simulate network call
        await Task.Delay(50 + Random.Shared.Next(100));

        // Create response based on request
        RpcResponse response = new RpcResponse
        {
            RequestId = request.RequestId,
            Success = true,
            StatusCode = 200,
            Result = $"Result from {request.ServiceName}.{request.MethodName}",
            ExecutionTimeMs = (long)(DateTime.UtcNow - startTime).TotalMilliseconds
        };

        Console.WriteLine($"[RPC Client] Response received: Status {response.StatusCode}, Time: {response.ExecutionTimeMs}ms");

        return response;
    }

    public RpcResponse CallSync(RpcRequest request)
    {
        return CallAsync(request).GetAwaiter().GetResult();
    }

    public Dictionary<string, int> GetRequestCounts()
    {
        return new Dictionary<string, int>(_requestCounts);
    }
}

// RPC Server - Handles incoming remote procedure calls
public class RpcServer
{
    private readonly string _serviceName;
    private readonly Dictionary<string, Func<Dictionary<string, object>, Task<object>>> _methodHandlers;
    private int _requestsHandled = 0;

    public RpcServer(string serviceName)
    {
        _serviceName = serviceName;
        _methodHandlers = new Dictionary<string, Func<Dictionary<string, object>, Task<object>>>();
    }

    public void RegisterMethod(string methodName, Func<Dictionary<string, object>, Task<object>> handler)
    {
        _methodHandlers[methodName] = handler;
        Console.WriteLine($"[RPC Server - {_serviceName}] Method '{methodName}' registered");
    }

    public async Task<RpcResponse> HandleRequestAsync(RpcRequest request)
    {
        _requestsHandled++;
        DateTime startTime = DateTime.UtcNow;

        Console.WriteLine($"\n[RPC Server - {_serviceName}] Handling {request.MethodName}() [RequestId: {request.RequestId}]");

        if (!_methodHandlers.ContainsKey(request.MethodName))
        {
            return new RpcResponse
            {
                RequestId = request.RequestId,
                Success = false,
                StatusCode = 404,
                ErrorMessage = $"Method '{request.MethodName}' not found on service '{_serviceName}'",
                ExecutionTimeMs = (long)(DateTime.UtcNow - startTime).TotalMilliseconds
            };
        }

        try
        {
            Func<Dictionary<string, object>, Task<object>> handler = _methodHandlers[request.MethodName];
            object result = await handler(request.Parameters);

            RpcResponse response = new RpcResponse
            {
                RequestId = request.RequestId,
                Success = true,
                StatusCode = 200,
                Result = result,
                ExecutionTimeMs = (long)(DateTime.UtcNow - startTime).TotalMilliseconds
            };

            Console.WriteLine($"[RPC Server - {_serviceName}] Request completed successfully in {response.ExecutionTimeMs}ms");
            return response;
        }
        catch (Exception ex)
        {
            return new RpcResponse
            {
                RequestId = request.RequestId,
                Success = false,
                StatusCode = 500,
                ErrorMessage = $"Internal server error: {ex.Message}",
                ExecutionTimeMs = (long)(DateTime.UtcNow - startTime).TotalMilliseconds
            };
        }
    }

    public int GetRequestsHandled()
    {
        return _requestsHandled;
    }
}

// User Service - Example microservice handling user operations
public class UserService
{
    private readonly RpcServer _rpcServer;
    private readonly Dictionary<int, User> _users = new Dictionary<int, User>();

    public UserService(RpcServer rpcServer)
    {
        _rpcServer = rpcServer;

        // Register RPC methods
        _rpcServer.RegisterMethod("GetUser", GetUserHandler);
        _rpcServer.RegisterMethod("CreateUser", CreateUserHandler);
        _rpcServer.RegisterMethod("UpdateUser", UpdateUserHandler);
        _rpcServer.RegisterMethod("DeleteUser", DeleteUserHandler);

        // Seed data
        _users[1] = new User { Id = 1, Name = "Alice Johnson", Email = "alice@example.com" };
        _users[2] = new User { Id = 2, Name = "Bob Smith", Email = "bob@example.com" };
    }

    private Task<object> GetUserHandler(Dictionary<string, object> parameters)
    {
        int userId = Convert.ToInt32(parameters["userId"]);

        if (_users.ContainsKey(userId))
        {
            User user = _users[userId];
            return Task.FromResult<object>($"User: {user.Name} ({user.Email})");
        }

        throw new Exception($"User with ID {userId} not found");
    }

    private Task<object> CreateUserHandler(Dictionary<string, object> parameters)
    {
        string name = parameters["name"].ToString() ?? string.Empty;
        string email = parameters["email"].ToString() ?? string.Empty;

        int newId = _users.Count + 1;
        User newUser = new User { Id = newId, Name = name, Email = email };
        _users[newId] = newUser;

        return Task.FromResult<object>($"Created user with ID {newId}: {name}");
    }

    private Task<object> UpdateUserHandler(Dictionary<string, object> parameters)
    {
        int userId = Convert.ToInt32(parameters["userId"]);

        if (!_users.ContainsKey(userId))
        {
            throw new Exception($"User with ID {userId} not found");
        }

        if (parameters.ContainsKey("name"))
        {
            _users[userId].Name = parameters["name"].ToString() ?? string.Empty;
        }

        if (parameters.ContainsKey("email"))
        {
            _users[userId].Email = parameters["email"].ToString() ?? string.Empty;
        }

        return Task.FromResult<object>($"Updated user {userId}");
    }

    private Task<object> DeleteUserHandler(Dictionary<string, object> parameters)
    {
        int userId = Convert.ToInt32(parameters["userId"]);

        if (_users.Remove(userId))
        {
            return Task.FromResult<object>($"Deleted user {userId}");
        }

        throw new Exception($"User with ID {userId} not found");
    }
}

// Order Service - Example microservice handling order operations
public class OrderService
{
    private readonly RpcServer _rpcServer;
    private readonly Dictionary<int, Order> _orders = new Dictionary<int, Order>();

    public OrderService(RpcServer rpcServer)
    {
        _rpcServer = rpcServer;

        // Register RPC methods
        _rpcServer.RegisterMethod("GetOrder", GetOrderHandler);
        _rpcServer.RegisterMethod("CreateOrder", CreateOrderHandler);
        _rpcServer.RegisterMethod("GetUserOrders", GetUserOrdersHandler);

        // Seed data
        _orders[101] = new Order { Id = 101, UserId = 1, Amount = 250.00m, Status = "Completed" };
        _orders[102] = new Order { Id = 102, UserId = 2, Amount = 450.00m, Status = "Pending" };
    }

    private Task<object> GetOrderHandler(Dictionary<string, object> parameters)
    {
        int orderId = Convert.ToInt32(parameters["orderId"]);

        if (_orders.ContainsKey(orderId))
        {
            Order order = _orders[orderId];
            return Task.FromResult<object>($"Order {order.Id}: ${order.Amount} ({order.Status})");
        }

        throw new Exception($"Order with ID {orderId} not found");
    }

    private Task<object> CreateOrderHandler(Dictionary<string, object> parameters)
    {
        int userId = Convert.ToInt32(parameters["userId"]);
        decimal amount = Convert.ToDecimal(parameters["amount"]);

        int newId = _orders.Count + 101;
        Order newOrder = new Order { Id = newId, UserId = userId, Amount = amount, Status = "Pending" };
        _orders[newId] = newOrder;

        return Task.FromResult<object>($"Created order {newId} for user {userId}: ${amount}");
    }

    private Task<object> GetUserOrdersHandler(Dictionary<string, object> parameters)
    {
        int userId = Convert.ToInt32(parameters["userId"]);

        List<Order> userOrders = new List<Order>();
        foreach (Order order in _orders.Values)
        {
            if (order.UserId == userId)
            {
                userOrders.Add(order);
            }
        }

        return Task.FromResult<object>($"User {userId} has {userOrders.Count} order(s)");
    }
}

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
}

// Payment Service - Example microservice for payment processing
public class PaymentService
{
    private readonly RpcServer _rpcServer;

    public PaymentService(RpcServer rpcServer)
    {
        _rpcServer = rpcServer;

        // Register RPC methods
        _rpcServer.RegisterMethod("ProcessPayment", ProcessPaymentHandler);
        _rpcServer.RegisterMethod("RefundPayment", RefundPaymentHandler);
    }

    private async Task<object> ProcessPaymentHandler(Dictionary<string, object> parameters)
    {
        int orderId = Convert.ToInt32(parameters["orderId"]);
        decimal amount = Convert.ToDecimal(parameters["amount"]);

        // Simulate payment processing
        await Task.Delay(100);

        if (amount > 10000)
        {
            throw new Exception("Payment amount exceeds limit");
        }

        string transactionId = $"TXN-{Guid.NewGuid().ToString().Substring(0, 8)}";
        return $"Payment processed: {transactionId} for ${amount}";
    }

    private Task<object> RefundPaymentHandler(Dictionary<string, object> parameters)
    {
        string transactionId = parameters["transactionId"].ToString() ?? string.Empty;
        decimal amount = Convert.ToDecimal(parameters["amount"]);

        return Task.FromResult<object>($"Refund processed for {transactionId}: ${amount}");
    }
}
