using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Microservices.API.APIGateway;

public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("=== APIGateway Pattern Demo ===\n");

        APIGateway gateway = new APIGateway();

        // Scenario 1: Successful authenticated request to user service
        Console.WriteLine("1. Authenticated request to fetch user details:");
        HttpRequest request1 = new HttpRequest
        {
            Method = "GET",
            Path = "/api/users/1",
            Headers = new Dictionary<string, string>
            {
                { "Authorization", "token-abc123" }
            }
        };
        HttpResponse response1 = await gateway.HandleRequestAsync(request1);
        PrintResponse(response1);

        // Scenario 2: Request without authentication (should fail)
        Console.WriteLine("\n2. Request without authentication token:");
        HttpRequest request2 = new HttpRequest
        {
            Method = "GET",
            Path = "/api/users/2"
        };
        HttpResponse response2 = await gateway.HandleRequestAsync(request2);
        PrintResponse(response2);

        // Scenario 3: Request with invalid token
        Console.WriteLine("\n3. Request with invalid authentication token:");
        HttpRequest request3 = new HttpRequest
        {
            Method = "GET",
            Path = "/api/users/2",
            Headers = new Dictionary<string, string>
            {
                { "Authorization", "invalid-token" }
            }
        };
        HttpResponse response3 = await gateway.HandleRequestAsync(request3);
        PrintResponse(response3);

        // Scenario 4: Public endpoint (no authentication required)
        Console.WriteLine("\n4. Public endpoint - fetch products (no auth required):");
        HttpRequest request4 = new HttpRequest
        {
            Method = "GET",
            Path = "/api/products"
        };
        HttpResponse response4 = await gateway.HandleRequestAsync(request4);
        PrintResponse(response4);

        // Scenario 5: Request to order service
        Console.WriteLine("\n5. Authenticated request to order service:");
        HttpRequest request5 = new HttpRequest
        {
            Method = "GET",
            Path = "/api/orders/101",
            Headers = new Dictionary<string, string>
            {
                { "Authorization", "token-def456" }
            }
        };
        HttpResponse response5 = await gateway.HandleRequestAsync(request5);
        PrintResponse(response5);

        // Scenario 6: Invalid route (404)
        Console.WriteLine("\n6. Request to non-existent route:");
        HttpRequest request6 = new HttpRequest
        {
            Method = "GET",
            Path = "/api/invalid",
            Headers = new Dictionary<string, string>
            {
                { "Authorization", "token-abc123" }
            }
        };
        HttpResponse response6 = await gateway.HandleRequestAsync(request6);
        PrintResponse(response6);

        // Scenario 7: Method not allowed (405)
        Console.WriteLine("\n7. Request with disallowed HTTP method:");
        HttpRequest request7 = new HttpRequest
        {
            Method = "DELETE",
            Path = "/api/products",
            Headers = new Dictionary<string, string>
            {
                { "Authorization", "token-abc123" }
            }
        };
        HttpResponse response7 = await gateway.HandleRequestAsync(request7);
        PrintResponse(response7);

        // Scenario 8: Load balancing demonstration
        Console.WriteLine("\n8. Multiple requests to demonstrate load balancing:");
        for (int i = 0; i < 3; i++)
        {
            HttpRequest requestLB = new HttpRequest
            {
                Method = "GET",
                Path = "/api/users",
                Headers = new Dictionary<string, string>
                {
                    { "Authorization", "token-ghi789" }
                }
            };
            HttpResponse responseLB = await gateway.HandleRequestAsync(requestLB);
            Console.WriteLine($"   Request {i + 1}: Status {responseLB.StatusCode}, " +
                            $"Response Time: {responseLB.ResponseTime.TotalMilliseconds}ms");
        }

        // Scenario 9: Rate limiting demonstration
        Console.WriteLine("\n9. Rate limiting demonstration (max 10 requests per minute):");
        for (int i = 0; i < 12; i++)
        {
            HttpRequest requestRL = new HttpRequest
            {
                Method = "GET",
                Path = "/api/users/1",
                Headers = new Dictionary<string, string>
                {
                    { "Authorization", "token-abc123" }
                }
            };
            HttpResponse responseRL = await gateway.HandleRequestAsync(requestRL);

            if (responseRL.StatusCode == 429)
            {
                Console.WriteLine($"   Request {i + 1}: RATE LIMIT EXCEEDED - {responseRL.Body}");
                break;
            }
            else
            {
                string remaining = responseRL.Headers.ContainsKey("X-RateLimit-Remaining")
                    ? responseRL.Headers["X-RateLimit-Remaining"]
                    : "N/A";
                Console.WriteLine($"   Request {i + 1}: Success - Remaining: {remaining}");
            }
        }

        // Scenario 10: Gateway statistics and request log
        Console.WriteLine("\n10. Gateway Statistics:");
        Dictionary<string, object> stats = gateway.GetGatewayStats();
        foreach (KeyValuePair<string, object> stat in stats)
        {
            Console.WriteLine($"   {stat.Key}: {stat.Value}");
        }

        Console.WriteLine("\n11. Recent Request Log (last 5):");
        List<string> logs = gateway.GetRequestLog();
        int startIndex = Math.Max(0, logs.Count - 5);
        for (int i = startIndex; i < logs.Count; i++)
        {
            Console.WriteLine($"   {logs[i]}");
        }

        Console.WriteLine("\n=== Demo Complete ===");
        Console.WriteLine("\nKey Features Demonstrated:");
        Console.WriteLine("- Request routing to multiple backend services");
        Console.WriteLine("- Authentication and authorization");
        Console.WriteLine("- Rate limiting per client");
        Console.WriteLine("- Load balancing across service instances");
        Console.WriteLine("- Method validation and error handling");
        Console.WriteLine("- Request logging and statistics");
        Console.WriteLine("- Gateway headers injection");
    }

    private static void PrintResponse(HttpResponse response)
    {
        Console.WriteLine($"   Status: {response.StatusCode}");
        Console.WriteLine($"   Body: {response.Body}");
        Console.WriteLine($"   Response Time: {response.ResponseTime.TotalMilliseconds}ms");
        if (response.Headers.Count > 0)
        {
            Console.WriteLine("   Headers:");
            foreach (KeyValuePair<string, string> header in response.Headers)
            {
                Console.WriteLine($"      {header.Key}: {header.Value}");
            }
        }
    }
}
