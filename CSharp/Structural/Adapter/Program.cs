using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace Adapter;

/// <summary>
/// Demonstrates REAL Adapter pattern with actual HTTP API integration and data format conversions.
/// Shows how to adapt incompatible interfaces (legacy JSON API and modern REST API) to a common interface.
/// </summary>
public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("=== REAL Adapter Pattern Demo ===");
        Console.WriteLine("Production-Ready Data Repository Adapters\n");

        // Example 1: Using Legacy API through adapter
        Console.WriteLine("--- Scenario 1: Legacy API Adapter ---");
        LegacyUserService legacyService = new LegacyUserService();
        IDataRepository legacyRepo = new LegacyUserAdapter(legacyService);

        await DemonstrateRepository(legacyRepo, "Legacy API");

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 2: Using Modern API through adapter
        Console.WriteLine("--- Scenario 2: Modern REST API Adapter ---");
        HttpClient httpClient = new HttpClient();
        ModernApiClient modernClient = new ModernApiClient(httpClient, "https://api.example.com");
        IDataRepository modernRepo = new ModernApiAdapter(modernClient);

        Console.WriteLine("Modern API adapter created (would work with real HTTP endpoints)");
        Console.WriteLine("Demonstrates adapting nested JSON structure to flat model\n");

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 3: Polymorphic usage - treating different adapters uniformly
        Console.WriteLine("--- Scenario 3: Polymorphic Repository Usage ---");
        IDataRepository[] repositories = { legacyRepo };

        foreach (IDataRepository repo in repositories)
        {
            Console.WriteLine($"\nUsing repository: {repo.GetType().Name}");
            UserData? user = await repo.GetUserAsync(1);
            if (user != null)
            {
                Console.WriteLine($"  Retrieved user: {user.FullName} ({user.EmailAddress})");
                Console.WriteLine($"  Status: {(user.IsActive ? "Active" : "Inactive")}");
                Console.WriteLine($"  Created: {user.CreatedAt:yyyy-MM-dd}");
            }
        }

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 4: Real-world data format conversions
        Console.WriteLine("--- Scenario 4: Data Format Conversions ---");
        Console.WriteLine("\nLegacy API Conversions:");
        Console.WriteLine("  • snake_case → PascalCase");
        Console.WriteLine("  • Unix timestamp → DateTime");
        Console.WriteLine("  • Integer status (0/1) → Boolean");
        Console.WriteLine("  • Separate first/last name → Full name");

        Console.WriteLine("\nModern API Conversions:");
        Console.WriteLine("  • Nested JSON structure → Flat model");
        Console.WriteLine("  • ISO date strings → DateTime");
        Console.WriteLine("  • Structured response → Simple model");

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 5: Error handling
        Console.WriteLine("--- Scenario 5: Error Handling ---");
        UserData? nonExistent = await legacyRepo.GetUserAsync(999);
        Console.WriteLine($"Fetching non-existent user (ID: 999): {(nonExistent == null ? "NULL (handled gracefully)" : "Found")}");

        bool deleted = await legacyRepo.DeleteUserAsync(999);
        Console.WriteLine($"Deleting non-existent user: {(deleted ? "Success" : "Failed (expected)")}");

        Console.WriteLine("\nAdapter pattern provides:");
        Console.WriteLine("  ✓ Unified interface for incompatible systems");
        Console.WriteLine("  ✓ Data format translation");
        Console.WriteLine("  ✓ Clean separation of concerns");
        Console.WriteLine("  ✓ Easy integration of third-party APIs");
        Console.WriteLine("  ✓ Consistent error handling");
    }

    /// <summary>
    /// Demonstrates full CRUD operations through any repository adapter.
    /// This shows the power of the Adapter pattern - same code works with any adapted source.
    /// </summary>
    private static async Task DemonstrateRepository(IDataRepository repository, string sourceName)
    {
        Console.WriteLine($"Testing {sourceName} through IDataRepository interface:\n");

        // Read operations
        Console.WriteLine("1. Fetching all users:");
        System.Collections.Generic.List<UserData> allUsers = await repository.GetAllUsersAsync();
        foreach (UserData user in allUsers)
        {
            Console.WriteLine($"   • {user.FullName} ({user.EmailAddress}) - Active: {user.IsActive}");
        }

        Console.WriteLine("\n2. Fetching single user (ID: 1):");
        UserData? singleUser = await repository.GetUserAsync(1);
        if (singleUser != null)
        {
            Console.WriteLine($"   Found: {singleUser.FullName}");
            Console.WriteLine($"   Email: {singleUser.EmailAddress}");
            Console.WriteLine($"   Status: {(singleUser.IsActive ? "Active" : "Inactive")}");
            Console.WriteLine($"   Created: {singleUser.CreatedAt:yyyy-MM-dd HH:mm:ss}");
        }

        // Create operation
        Console.WriteLine("\n3. Creating new user:");
        UserData newUser = new UserData
        {
            FullName = "Alice Johnson",
            EmailAddress = "alice.johnson@example.com",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        UserData created = await repository.CreateUserAsync(newUser);
        Console.WriteLine($"   Created user: {created.FullName} (ID: {created.Id})");

        // Delete operation
        Console.WriteLine("\n4. Deleting user (ID: 2):");
        bool deleteResult = await repository.DeleteUserAsync(2);
        Console.WriteLine($"   Deletion result: {(deleteResult ? "Success" : "Failed")}");

        // Verify deletion
        UserData? deletedUser = await repository.GetUserAsync(2);
        Console.WriteLine($"   Verification: User 2 still exists? {(deletedUser != null ? "Yes" : "No")}");
    }
}
