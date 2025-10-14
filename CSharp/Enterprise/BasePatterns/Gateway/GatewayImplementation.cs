using System;
using System.Collections.Generic;

namespace Enterprise.BasePatterns.Gateway;

/// <summary>
/// Demonstrates the Gateway pattern with various external system scenarios.
/// The Gateway pattern encapsulates access to external systems or resources,
/// providing a simplified interface and hiding complex interactions.
/// </summary>
public class GatewayImplementation : IGateway
{
    public void Execute()
    {
        Console.WriteLine("=== Gateway Pattern Implementation ===\n");

        DemoExternalApiGateway();
        Console.WriteLine("\n" + new string('-', 70) + "\n");

        DemoDatabaseGateway();
        Console.WriteLine("\n" + new string('-', 70) + "\n");

        DemoFileSystemGateway();
        Console.WriteLine("\n" + new string('-', 70) + "\n");

        DemoGatewayBenefits();
        Console.WriteLine("\n" + new string('-', 70) + "\n");

        DemoErrorHandling();
    }

    /// <summary>
    /// Demonstrates using a gateway to access external APIs.
    /// </summary>
    private void DemoExternalApiGateway()
    {
        Console.WriteLine("--- External API Gateway Demo ---\n");

        ExternalApiGateway apiGateway = new ExternalApiGateway(
            "https://api.example.com",
            "secret-api-key-12345"
        );

        Console.WriteLine("1. Fetching user data:");
        string userData = apiGateway.GetData("/users/123");
        Console.WriteLine($"   Response: {userData}");

        Console.WriteLine("\n2. Fetching user data again (should hit cache):");
        string cachedUserData = apiGateway.GetData("/users/123");
        Console.WriteLine($"   Response: {cachedUserData}");

        Console.WriteLine("\n3. Fetching product data:");
        string productData = apiGateway.GetData("/products/456");
        Console.WriteLine($"   Response: {productData}");

        Console.WriteLine("\n4. Creating a new order:");
        string orderData = apiGateway.PostData("/orders", "{\"productId\": 456, \"quantity\": 2}");
        Console.WriteLine($"   Response: {orderData}");

        Console.WriteLine("\n5. Updating user information:");
        string updateResponse = apiGateway.UpdateData("/users/123", "{\"name\": \"Jane Doe\"}");
        Console.WriteLine($"   Response: {updateResponse}");

        Console.WriteLine("\n6. Deleting an order:");
        bool deleteSuccess = apiGateway.DeleteData("/orders/789");
        Console.WriteLine($"   Deletion successful: {deleteSuccess}");

        Console.WriteLine($"\n7. Total API requests made: {apiGateway.GetRequestCount()}");

        Console.WriteLine("\n8. Clearing cache and refetching:");
        apiGateway.ClearCache();
        string refetchedData = apiGateway.GetData("/users/123");
        Console.WriteLine($"   Response: {refetchedData}");
        Console.WriteLine($"   Total API requests: {apiGateway.GetRequestCount()}");
    }

    /// <summary>
    /// Demonstrates using a gateway to access database operations.
    /// </summary>
    private void DemoDatabaseGateway()
    {
        Console.WriteLine("--- Database Gateway Demo ---\n");

        DatabaseGateway dbGateway = new DatabaseGateway(
            "Server=localhost;Database=TestDB;User=admin;Password=***"
        );

        Console.WriteLine("1. Connecting to database:");
        dbGateway.Connect();

        Console.WriteLine("\n2. Inserting user records:");
        Dictionary<string, object> user1 = new Dictionary<string, object>
        {
            ["name"] = "Alice Johnson",
            ["email"] = "alice@example.com",
            ["age"] = 28
        };
        int userId1 = dbGateway.Insert("users", user1);
        Console.WriteLine($"   User inserted with ID: {userId1}");

        Dictionary<string, object> user2 = new Dictionary<string, object>
        {
            ["name"] = "Bob Smith",
            ["email"] = "bob@example.com",
            ["age"] = 35
        };
        int userId2 = dbGateway.Insert("users", user2);
        Console.WriteLine($"   User inserted with ID: {userId2}");

        Console.WriteLine("\n3. Inserting product records:");
        Dictionary<string, object> product = new Dictionary<string, object>
        {
            ["name"] = "Laptop",
            ["price"] = 999.99,
            ["stock"] = 50
        };
        int productId = dbGateway.Insert("products", product);
        Console.WriteLine($"   Product inserted with ID: {productId}");

        Console.WriteLine("\n4. Finding user by ID:");
        Dictionary<string, object>? foundUser = dbGateway.FindById(userId1);
        if (foundUser != null)
        {
            Console.WriteLine($"   Found: {foundUser["name"]} ({foundUser["email"]})");
        }

        Console.WriteLine("\n5. Updating user information:");
        Dictionary<string, object> updates = new Dictionary<string, object>
        {
            ["age"] = 29,
            ["email"] = "alice.johnson@example.com"
        };
        bool updateSuccess = dbGateway.Update(userId1, updates);
        Console.WriteLine($"   Update successful: {updateSuccess}");

        Console.WriteLine("\n6. Verifying update:");
        Dictionary<string, object>? updatedUser = dbGateway.FindById(userId1);
        if (updatedUser != null)
        {
            Console.WriteLine($"   Updated: {updatedUser["name"]}, Age: {updatedUser["age"]}, Email: {updatedUser["email"]}");
        }

        Console.WriteLine("\n7. Finding all users:");
        List<Dictionary<string, object>> allUsers = dbGateway.FindByTable("users");
        Console.WriteLine($"   Found {allUsers.Count} users:");
        foreach (Dictionary<string, object> user in allUsers)
        {
            Console.WriteLine($"     - ID: {user["_id"]}, Name: {user["name"]}");
        }

        Console.WriteLine("\n8. Executing custom query:");
        int affectedRows = dbGateway.ExecuteQuery("UPDATE users SET status = 'active' WHERE age > 25");
        Console.WriteLine($"   Affected rows: {affectedRows}");

        Console.WriteLine("\n9. Deleting a user:");
        bool deleteSuccess = dbGateway.Delete(userId2);
        Console.WriteLine($"   Deletion successful: {deleteSuccess}");

        Console.WriteLine("\n10. Verifying deletion:");
        Dictionary<string, object>? deletedUser = dbGateway.FindById(userId2);
        Console.WriteLine($"   User found: {deletedUser != null}");

        Console.WriteLine("\n11. Disconnecting from database:");
        dbGateway.Disconnect();
    }

    /// <summary>
    /// Demonstrates using a gateway to access file system operations.
    /// </summary>
    private void DemoFileSystemGateway()
    {
        Console.WriteLine("--- File System Gateway Demo ---\n");

        FileSystemGateway fsGateway = new FileSystemGateway("/app/data");

        Console.WriteLine("1. Writing files:");
        fsGateway.WriteFile("config.json", "{\"setting1\": \"value1\", \"setting2\": \"value2\"}");
        fsGateway.WriteFile("data.txt", "This is sample data content.");
        fsGateway.WriteFile("logs/app.log", "Application started successfully.");

        Console.WriteLine("\n2. Checking file existence:");
        bool configExists = fsGateway.FileExists("config.json");
        bool missingExists = fsGateway.FileExists("missing.txt");
        Console.WriteLine($"   config.json exists: {configExists}");
        Console.WriteLine($"   missing.txt exists: {missingExists}");

        Console.WriteLine("\n3. Reading files:");
        string configContent = fsGateway.ReadFile("config.json");
        Console.WriteLine($"   config.json content: {configContent}");

        string dataContent = fsGateway.ReadFile("data.txt");
        Console.WriteLine($"   data.txt content: {dataContent}");

        Console.WriteLine("\n4. Listing all files:");
        List<string> files = fsGateway.ListFiles();
        foreach (string file in files)
        {
            Console.WriteLine($"   - {file}");
        }

        Console.WriteLine("\n5. Updating a file:");
        fsGateway.WriteFile("data.txt", "Updated data content with more information.");
        string updatedContent = fsGateway.ReadFile("data.txt");
        Console.WriteLine($"   Updated content: {updatedContent}");

        Console.WriteLine("\n6. Deleting a file:");
        bool deleteSuccess = fsGateway.DeleteFile("logs/app.log");
        Console.WriteLine($"   Deletion successful: {deleteSuccess}");

        Console.WriteLine("\n7. Verifying deletion:");
        bool deletedExists = fsGateway.FileExists("logs/app.log");
        Console.WriteLine($"   File still exists: {deletedExists}");

        Console.WriteLine("\n8. Final file list:");
        List<string> finalFiles = fsGateway.ListFiles();
        Console.WriteLine($"   Total files: {finalFiles.Count}");
    }

    /// <summary>
    /// Demonstrates the benefits of using gateways.
    /// </summary>
    private void DemoGatewayBenefits()
    {
        Console.WriteLine("--- Gateway Pattern Benefits ---\n");

        Console.WriteLine("Benefits of the Gateway Pattern:");
        Console.WriteLine("  1. Encapsulation: Hides complex external system interactions");
        Console.WriteLine("  2. Abstraction: Provides a simple interface for external resources");
        Console.WriteLine("  3. Testability: Easy to create mock gateways for testing");
        Console.WriteLine("  4. Maintainability: Changes to external systems are isolated");
        Console.WriteLine("  5. Performance: Can add caching, connection pooling, etc.");
        Console.WriteLine("  6. Error Handling: Centralized error handling and retry logic");
        Console.WriteLine("  7. Security: Single point for authentication and authorization");
        Console.WriteLine("  8. Monitoring: Centralized logging and metrics collection");

        Console.WriteLine("\nExample: Switching API providers");
        Console.WriteLine("  - Application code doesn't change");
        Console.WriteLine("  - Only the gateway implementation changes");
        Console.WriteLine("  - All API interactions remain consistent");

        Console.WriteLine("\nExample: Adding caching");
        ExternalApiGateway api = new ExternalApiGateway("https://api.example.com", "key");
        Console.WriteLine("  First call (hits API):");
        api.GetData("/data");
        Console.WriteLine("  Second call (hits cache):");
        api.GetData("/data");
        Console.WriteLine($"  Total API calls made: {api.GetRequestCount()} (only 1, thanks to caching!)");

        Console.WriteLine("\nExample: Connection management");
        DatabaseGateway db = new DatabaseGateway("connection-string");
        Console.WriteLine("  Gateway manages connection lifecycle:");
        db.Connect();
        Console.WriteLine("  ... perform operations ...");
        db.Disconnect();
        Console.WriteLine("  Connection properly closed by gateway");
    }

    /// <summary>
    /// Demonstrates error handling in gateways.
    /// </summary>
    private void DemoErrorHandling()
    {
        Console.WriteLine("--- Gateway Error Handling ---\n");

        Console.WriteLine("1. File not found error:");
        FileSystemGateway fsGateway = new FileSystemGateway("/app/data");
        try
        {
            string content = fsGateway.ReadFile("nonexistent.txt");
        }
        catch (FileNotFoundException ex)
        {
            Console.WriteLine($"   Caught exception: {ex.Message}");
        }

        Console.WriteLine("\n2. Database not connected error:");
        DatabaseGateway dbGateway = new DatabaseGateway("connection-string");
        try
        {
            dbGateway.Insert("users", new Dictionary<string, object> { ["name"] = "Test" });
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine($"   Caught exception: {ex.Message}");
        }

        Console.WriteLine("\n3. Double connection error:");
        dbGateway.Connect();
        try
        {
            dbGateway.Connect(); // Try to connect again
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine($"   Caught exception: {ex.Message}");
        }
        finally
        {
            dbGateway.Disconnect();
        }

        Console.WriteLine("\n4. Graceful error handling:");
        Console.WriteLine("   Gateways should:");
        Console.WriteLine("   - Provide clear error messages");
        Console.WriteLine("   - Handle timeouts appropriately");
        Console.WriteLine("   - Implement retry logic when appropriate");
        Console.WriteLine("   - Log errors for debugging");
        Console.WriteLine("   - Convert external exceptions to application-specific ones");
    }
}
