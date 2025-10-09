using System;
using System.Threading.Tasks;

namespace Facade;

/// <summary>
/// Demonstrates REAL Facade pattern with caching, validation, and logging subsystems.
/// Shows how to simplify complex subsystem interactions through a unified interface.
/// </summary>
public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("=== REAL Facade Pattern Demo ===");
        Console.WriteLine("Production-Ready User Management Facade\n");

        // Setup complex subsystems
        DataService dataService = new DataService();
        CacheService cacheService = new CacheService(ttlSeconds: 60);
        ValidationService validationService = new ValidationService();
        LoggingService loggingService = new LoggingService();

        // Create facade that simplifies interaction with all subsystems
        UserManagementFacade facade = new UserManagementFacade(
            dataService,
            cacheService,
            validationService,
            loggingService
        );

        // Example 1: Get user (demonstrates caching)
        Console.WriteLine("--- Scenario 1: Get User with Caching ---\n");
        User? user1 = await facade.GetUserAsync(1);
        if (user1 != null)
        {
            Console.WriteLine($"\nRetrieved: {user1.Username} ({user1.Email})");
        }

        Console.WriteLine("\n--- Second request (should hit cache) ---\n");
        User? user1Cached = await facade.GetUserAsync(1);

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 2: Create user with validation
        Console.WriteLine("--- Scenario 2: Create User with Validation ---\n");

        User newUser = new User
        {
            Username = "newuser",
            Email = "newuser@example.com",
            IsActive = true
        };

        (bool success, User? created, ValidationResult validation) = await facade.CreateUserAsync(newUser);

        if (success && created != null)
        {
            Console.WriteLine($"\nUser created successfully: ID {created.Id}");
        }

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 3: Create user with validation failure
        Console.WriteLine("--- Scenario 3: Create User with Validation Failure ---\n");

        User invalidUser = new User
        {
            Username = "ab", // Too short
            Email = "invalid-email", // Invalid format
            IsActive = true
        };

        (bool failSuccess, User? failCreated, ValidationResult failValidation) = await facade.CreateUserAsync(invalidUser);

        if (!failSuccess)
        {
            Console.WriteLine("\nValidation errors:");
            foreach (string error in failValidation.Errors)
            {
                Console.WriteLine($"  - {error}");
            }
        }

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 4: Get all users
        Console.WriteLine("--- Scenario 4: Get All Users ---\n");
        System.Collections.Generic.List<User> allUsers = await facade.GetAllUsersAsync();
        Console.WriteLine($"\nTotal users: {allUsers.Count}");
        foreach (User user in allUsers)
        {
            Console.WriteLine($"  - {user.Username} ({user.Email})");
        }

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 5: System statistics
        Console.WriteLine("--- Scenario 5: System Statistics ---\n");
        SystemStats stats = await facade.GetSystemStatsAsync();
        Console.WriteLine($"\nSystem Statistics:");
        Console.WriteLine($"  Total Users: {stats.TotalUsers}");
        Console.WriteLine($"  Active Users: {stats.ActiveUsers}");
        Console.WriteLine($"  Cache Entries: {stats.CacheSize}");
        Console.WriteLine($"  Log Entries: {stats.LogCount}");

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 6: Delete user
        Console.WriteLine("--- Scenario 6: Delete User ---\n");
        bool deleted = await facade.DeleteUserAsync(2);
        Console.WriteLine($"\nDeletion result: {(deleted ? "Success" : "Failed")}");

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 7: Compare with direct subsystem usage
        Console.WriteLine("--- Scenario 7: Without Facade (Complex) ---\n");
        Console.WriteLine("Direct subsystem usage requires multiple steps:\n");

        User directUser = new User { Username = "direct", Email = "direct@example.com", IsActive = true };

        // 1. Validate
        ValidationResult directValidation = await validationService.ValidateUserAsync(directUser);
        if (!directValidation.IsValid)
        {
            Console.WriteLine("Validation failed");
        }

        // 2. Log
        await loggingService.LogInfoAsync("Creating user directly");

        // 3. Create in database
        User directCreated = await dataService.CreateUserAsync(directUser);

        // 4. Invalidate cache
        await cacheService.InvalidateAsync("all_users");

        // 5. Log success
        await loggingService.LogInfoAsync($"User created: {directCreated.Id}");

        Console.WriteLine("\nWith facade, all of this is done in ONE simple call!");

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 8: Clear system
        Console.WriteLine("--- Scenario 8: Clear System ---\n");
        await facade.ClearSystemAsync();

        Console.WriteLine("\n" + new string('=', 70));
        Console.WriteLine("\nFacade pattern provides:");
        Console.WriteLine("  ✓ Simplified interface to complex subsystems");
        Console.WriteLine("  ✓ Reduced coupling between client and subsystems");
        Console.WriteLine("  ✓ Easier to use and understand");
        Console.WriteLine("  ✓ Automatic handling of cross-cutting concerns");
        Console.WriteLine("  ✓ Single entry point for related operations");
        Console.WriteLine("  ✓ Encapsulation of subsystem complexity");
    }
}
