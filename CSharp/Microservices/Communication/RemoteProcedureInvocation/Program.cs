using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Microservices.Communication.RemoteProcedureInvocation;

public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("=== Remote Procedure Invocation Pattern Demo ===\n");

        // Initialize service registry
        RpcServiceRegistry registry = new RpcServiceRegistry();

        // Register services
        Console.WriteLine("--- Service Registration ---");
        registry.RegisterService("UserService", "localhost", 5001, RpcProtocol.GRPC);
        registry.RegisterService("OrderService", "localhost", 5002, RpcProtocol.GRPC);
        registry.RegisterService("PaymentService", "localhost", 5003, RpcProtocol.HTTP);

        // Create RPC servers for each service
        RpcServer userServer = new RpcServer("UserService");
        RpcServer orderServer = new RpcServer("OrderService");
        RpcServer paymentServer = new RpcServer("PaymentService");

        // Initialize services (which register their methods)
        Console.WriteLine("\n--- Service Initialization ---");
        UserService userService = new UserService(userServer);
        OrderService orderService = new OrderService(orderServer);
        PaymentService paymentService = new PaymentService(paymentServer);

        // Create RPC client
        RpcClient client = new RpcClient(registry);

        // Scenario 1: Simple RPC call to get user
        Console.WriteLine("\n=== Scenario 1: Get User via RPC ===");
        RpcRequest getUserRequest = new RpcRequest
        {
            ServiceName = "UserService",
            MethodName = "GetUser",
            Parameters = new Dictionary<string, object> { { "userId", 1 } },
            Protocol = RpcProtocol.GRPC
        };

        RpcResponse getUserResponse = await client.CallAsync(getUserRequest);
        await userServer.HandleRequestAsync(getUserRequest);

        if (getUserResponse.Success)
        {
            Console.WriteLine($"Client received: {getUserResponse.Result}");
        }

        // Scenario 2: Create new user via RPC
        Console.WriteLine("\n=== Scenario 2: Create User via RPC ===");
        RpcRequest createUserRequest = new RpcRequest
        {
            ServiceName = "UserService",
            MethodName = "CreateUser",
            Parameters = new Dictionary<string, object>
            {
                { "name", "Charlie Brown" },
                { "email", "charlie@example.com" }
            }
        };

        RpcResponse createUserResponse = await client.CallAsync(createUserRequest);
        RpcResponse serverCreateResponse = await userServer.HandleRequestAsync(createUserRequest);

        if (serverCreateResponse.Success)
        {
            Console.WriteLine($"Server result: {serverCreateResponse.Result}");
        }

        // Scenario 3: Update user via RPC
        Console.WriteLine("\n=== Scenario 3: Update User via RPC ===");
        RpcRequest updateUserRequest = new RpcRequest
        {
            ServiceName = "UserService",
            MethodName = "UpdateUser",
            Parameters = new Dictionary<string, object>
            {
                { "userId", 1 },
                { "email", "alice.johnson@example.com" }
            }
        };

        await client.CallAsync(updateUserRequest);
        RpcResponse serverUpdateResponse = await userServer.HandleRequestAsync(updateUserRequest);

        if (serverUpdateResponse.Success)
        {
            Console.WriteLine($"Server result: {serverUpdateResponse.Result}");
        }

        // Scenario 4: Get order via RPC
        Console.WriteLine("\n=== Scenario 4: Get Order via RPC ===");
        RpcRequest getOrderRequest = new RpcRequest
        {
            ServiceName = "OrderService",
            MethodName = "GetOrder",
            Parameters = new Dictionary<string, object> { { "orderId", 101 } }
        };

        await client.CallAsync(getOrderRequest);
        RpcResponse serverGetOrderResponse = await orderServer.HandleRequestAsync(getOrderRequest);

        if (serverGetOrderResponse.Success)
        {
            Console.WriteLine($"Server result: {serverGetOrderResponse.Result}");
        }

        // Scenario 5: Create order and process payment (cross-service RPC calls)
        Console.WriteLine("\n=== Scenario 5: Create Order and Process Payment ===");

        // First, create an order
        RpcRequest createOrderRequest = new RpcRequest
        {
            ServiceName = "OrderService",
            MethodName = "CreateOrder",
            Parameters = new Dictionary<string, object>
            {
                { "userId", 1 },
                { "amount", 750.00m }
            }
        };

        await client.CallAsync(createOrderRequest);
        RpcResponse serverCreateOrderResponse = await orderServer.HandleRequestAsync(createOrderRequest);

        if (serverCreateOrderResponse.Success)
        {
            Console.WriteLine($"Order created: {serverCreateOrderResponse.Result}");

            // Then, process payment for the order
            RpcRequest processPaymentRequest = new RpcRequest
            {
                ServiceName = "PaymentService",
                MethodName = "ProcessPayment",
                Parameters = new Dictionary<string, object>
                {
                    { "orderId", 103 },
                    { "amount", 750.00m }
                },
                Protocol = RpcProtocol.HTTP
            };

            await client.CallAsync(processPaymentRequest);
            RpcResponse serverPaymentResponse = await paymentServer.HandleRequestAsync(processPaymentRequest);

            if (serverPaymentResponse.Success)
            {
                Console.WriteLine($"Payment result: {serverPaymentResponse.Result}");
            }
        }

        // Scenario 6: Error handling - calling non-existent method
        Console.WriteLine("\n=== Scenario 6: Error Handling - Non-existent Method ===");
        RpcRequest invalidMethodRequest = new RpcRequest
        {
            ServiceName = "UserService",
            MethodName = "NonExistentMethod",
            Parameters = new Dictionary<string, object>()
        };

        await client.CallAsync(invalidMethodRequest);
        RpcResponse invalidMethodResponse = await userServer.HandleRequestAsync(invalidMethodRequest);

        Console.WriteLine($"Status: {invalidMethodResponse.StatusCode}");
        Console.WriteLine($"Error: {invalidMethodResponse.ErrorMessage}");

        // Scenario 7: Error handling - calling non-existent service
        Console.WriteLine("\n=== Scenario 7: Error Handling - Non-existent Service ===");
        RpcRequest invalidServiceRequest = new RpcRequest
        {
            ServiceName = "NonExistentService",
            MethodName = "SomeMethod",
            Parameters = new Dictionary<string, object>()
        };

        RpcResponse invalidServiceResponse = await client.CallAsync(invalidServiceRequest);

        Console.WriteLine($"Status: {invalidServiceResponse.StatusCode}");
        Console.WriteLine($"Error: {invalidServiceResponse.ErrorMessage}");

        // Scenario 8: Error handling - business logic error
        Console.WriteLine("\n=== Scenario 8: Error Handling - Business Logic Error ===");
        RpcRequest getUserNotFoundRequest = new RpcRequest
        {
            ServiceName = "UserService",
            MethodName = "GetUser",
            Parameters = new Dictionary<string, object> { { "userId", 9999 } }
        };

        await client.CallAsync(getUserNotFoundRequest);
        RpcResponse serverUserNotFoundResponse = await userServer.HandleRequestAsync(getUserNotFoundRequest);

        Console.WriteLine($"Status: {serverUserNotFoundResponse.StatusCode}");
        Console.WriteLine($"Error: {serverUserNotFoundResponse.ErrorMessage}");

        // Scenario 9: Payment exceeding limit
        Console.WriteLine("\n=== Scenario 9: Payment Exceeding Limit ===");
        RpcRequest largePaymentRequest = new RpcRequest
        {
            ServiceName = "PaymentService",
            MethodName = "ProcessPayment",
            Parameters = new Dictionary<string, object>
            {
                { "orderId", 104 },
                { "amount", 15000.00m }
            }
        };

        await client.CallAsync(largePaymentRequest);
        RpcResponse largePaymentResponse = await paymentServer.HandleRequestAsync(largePaymentRequest);

        Console.WriteLine($"Status: {largePaymentResponse.StatusCode}");
        Console.WriteLine($"Error: {largePaymentResponse.ErrorMessage}");

        // Scenario 10: Get user orders
        Console.WriteLine("\n=== Scenario 10: Get User Orders ===");
        RpcRequest getUserOrdersRequest = new RpcRequest
        {
            ServiceName = "OrderService",
            MethodName = "GetUserOrders",
            Parameters = new Dictionary<string, object> { { "userId", 1 } }
        };

        await client.CallAsync(getUserOrdersRequest);
        RpcResponse serverGetUserOrdersResponse = await orderServer.HandleRequestAsync(getUserOrdersRequest);

        if (serverGetUserOrdersResponse.Success)
        {
            Console.WriteLine($"Server result: {serverGetUserOrdersResponse.Result}");
        }

        // Scenario 11: Multiple concurrent RPC calls
        Console.WriteLine("\n=== Scenario 11: Concurrent RPC Calls ===");
        List<Task<RpcResponse>> concurrentTasks = new List<Task<RpcResponse>>();

        for (int i = 1; i <= 3; i++)
        {
            RpcRequest concurrentRequest = new RpcRequest
            {
                ServiceName = "UserService",
                MethodName = "GetUser",
                Parameters = new Dictionary<string, object> { { "userId", i % 2 + 1 } }
            };

            concurrentTasks.Add(client.CallAsync(concurrentRequest));
        }

        RpcResponse[] concurrentResponses = await Task.WhenAll(concurrentTasks);

        for (int i = 0; i < concurrentResponses.Length; i++)
        {
            Console.WriteLine($"Concurrent call {i + 1}: Status {concurrentResponses[i].StatusCode}, " +
                            $"Time: {concurrentResponses[i].ExecutionTimeMs}ms");
        }

        // Scenario 12: Service statistics
        Console.WriteLine("\n=== Scenario 12: Service Statistics ===");
        Console.WriteLine($"UserService handled: {userServer.GetRequestsHandled()} requests");
        Console.WriteLine($"OrderService handled: {orderServer.GetRequestsHandled()} requests");
        Console.WriteLine($"PaymentService handled: {paymentServer.GetRequestsHandled()} requests");

        // Scenario 13: Client request counts
        Console.WriteLine("\n=== Scenario 13: Client Request Counts ===");
        Dictionary<string, int> requestCounts = client.GetRequestCounts();
        foreach (KeyValuePair<string, int> kvp in requestCounts)
        {
            Console.WriteLine($"   {kvp.Key}: {kvp.Value} requests");
        }

        // Scenario 14: Service discovery
        Console.WriteLine("\n=== Scenario 14: Service Discovery ===");
        List<ServiceEndpoint> allServices = registry.GetAllServices();
        Console.WriteLine($"Total services registered: {allServices.Count}");
        foreach (ServiceEndpoint endpoint in allServices)
        {
            Console.WriteLine($"   - {endpoint.ServiceName} at {endpoint.Host}:{endpoint.Port} " +
                            $"({endpoint.Protocol}) - Status: {endpoint.Status}");
        }

        // Scenario 15: Synchronous RPC call
        Console.WriteLine("\n=== Scenario 15: Synchronous RPC Call ===");
        RpcRequest syncRequest = new RpcRequest
        {
            ServiceName = "UserService",
            MethodName = "GetUser",
            Parameters = new Dictionary<string, object> { { "userId", 2 } }
        };

        RpcResponse syncResponse = client.CallSync(syncRequest);
        Console.WriteLine($"Sync call completed: Status {syncResponse.StatusCode}, Time: {syncResponse.ExecutionTimeMs}ms");

        Console.WriteLine("\n=== Demo Complete ===");
        Console.WriteLine("\nKey Features Demonstrated:");
        Console.WriteLine("- Asynchronous and synchronous RPC calls");
        Console.WriteLine("- Service registration and discovery");
        Console.WriteLine("- Multiple RPC protocols (gRPC, HTTP)");
        Console.WriteLine("- Method registration and invocation");
        Console.WriteLine("- Cross-service communication");
        Console.WriteLine("- Error handling and validation");
        Console.WriteLine("- Request/response tracking");
        Console.WriteLine("- Concurrent RPC calls");
        Console.WriteLine("- Service statistics and monitoring");
    }
}
