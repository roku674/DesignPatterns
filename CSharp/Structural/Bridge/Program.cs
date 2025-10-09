using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Bridge;

/// <summary>
/// Demonstrates REAL Bridge pattern with actual database abstraction.
/// Shows how abstraction and implementation can vary independently.
/// Different database engines (SQL Server, PostgreSQL, MongoDB) work with same abstraction layer.
/// </summary>
public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("=== REAL Bridge Pattern Demo ===");
        Console.WriteLine("Production-Ready Database Abstraction Layer\n");

        // Example 1: Basic Data Access with SQL Server
        Console.WriteLine("--- Scenario 1: Basic Data Access with SQL Server ---\n");
        IDatabase sqlServer = new SqlServerDatabase();
        DataAccessLayer basicSqlAccess = new BasicDataAccess(sqlServer);

        await DemonstrateBasicOperations(basicSqlAccess, "Server=localhost;Database=Products;");

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 2: Basic Data Access with PostgreSQL
        Console.WriteLine("--- Scenario 2: Basic Data Access with PostgreSQL ---\n");
        IDatabase postgreSql = new PostgreSqlDatabase();
        DataAccessLayer basicPgAccess = new BasicDataAccess(postgreSql);

        await DemonstrateBasicOperations(basicPgAccess, "Host=localhost;Database=products;");

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 3: Basic Data Access with MongoDB
        Console.WriteLine("--- Scenario 3: Basic Data Access with MongoDB (NoSQL) ---\n");
        IDatabase mongo = new MongoDatabase();
        DataAccessLayer basicMongoAccess = new BasicDataAccess(mongo);

        await DemonstrateBasicOperations(basicMongoAccess, "mongodb://localhost:27017/products");

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 4: Advanced Data Access with Transactions
        Console.WriteLine("--- Scenario 4: Advanced Data Access with Transactions ---\n");
        IDatabase sqlServer2 = new SqlServerDatabase();
        AdvancedDataAccess advancedAccess = new AdvancedDataAccess(sqlServer2);
        await advancedAccess.ConnectAsync("Server=localhost;Database=Products;");

        // Bulk insert with transaction
        List<Product> newProducts = new List<Product>
        {
            new Product { Name = "Tablet", Price = 399.99m, StockQuantity = 60, Category = "Electronics" },
            new Product { Name = "Headphones", Price = 79.99m, StockQuantity = 150, Category = "Electronics" }
        };

        await advancedAccess.BulkAddProductsAsync(newProducts);

        // Price update with transaction
        await advancedAccess.UpdateProductPriceAsync(1, 899.99m);

        // Category filtering
        await advancedAccess.GetProductsByCategoryAsync("Electronics");

        // Inventory value calculation
        await advancedAccess.GetTotalInventoryValueAsync();

        await advancedAccess.DisconnectAsync();

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 5: Switching implementations at runtime
        Console.WriteLine("--- Scenario 5: Runtime Implementation Switching ---\n");
        await DemonstrateBridgeFlexibility();

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 6: Polymorphic usage
        Console.WriteLine("--- Scenario 6: Polymorphic Database Access ---\n");
        IDatabase[] databases = { new SqlServerDatabase(), new PostgreSqlDatabase(), new MongoDatabase() };

        foreach (IDatabase db in databases)
        {
            DataAccessLayer dal = new BasicDataAccess(db);
            await dal.ConnectAsync($"ConnectionString for {db.GetDatabaseType()}");
            Console.WriteLine($"Connected to: {dal.GetImplementationType()}");

            List<Product> products = await dal.GetAllProductsAsync();
            Console.WriteLine($"Product count: {products.Count}\n");

            await dal.DisconnectAsync();
        }

        Console.WriteLine(new string('=', 70));
        Console.WriteLine("\nBridge pattern provides:");
        Console.WriteLine("  ✓ Separation of abstraction from implementation");
        Console.WriteLine("  ✓ Independent variation of both hierarchies");
        Console.WriteLine("  ✓ Runtime implementation switching");
        Console.WriteLine("  ✓ Reduced coupling between components");
        Console.WriteLine("  ✓ Easier testing with mock implementations");
        Console.WriteLine("  ✓ Support for multiple database systems");
    }

    /// <summary>
    /// Demonstrates basic CRUD operations that work with ANY database implementation.
    /// This is the power of the Bridge pattern - same code, different implementations.
    /// </summary>
    private static async Task DemonstrateBasicOperations(DataAccessLayer dal, string connectionString)
    {
        await dal.ConnectAsync(connectionString);
        Console.WriteLine($"Using: {dal.GetImplementationType()}\n");

        // Read all
        Console.WriteLine("1. Getting all products:");
        List<Product> allProducts = await dal.GetAllProductsAsync();
        foreach (Product product in allProducts)
        {
            Console.WriteLine($"   • {product.Name}: ${product.Price} (Stock: {product.StockQuantity})");
        }

        // Read one
        Console.WriteLine("\n2. Getting product by ID (1):");
        Product? product1 = await dal.GetProductByIdAsync(1);
        if (product1 != null)
        {
            Console.WriteLine($"   Found: {product1.Name} - ${product1.Price}");
        }

        // Create
        Console.WriteLine("\n3. Adding new product:");
        Product newProduct = new Product
        {
            Name = "New Item",
            Price = 99.99m,
            StockQuantity = 50,
            Category = "Test"
        };
        bool added = await dal.AddProductAsync(newProduct);
        Console.WriteLine($"   Add result: {(added ? "Success" : "Failed")}");

        // Update
        Console.WriteLine("\n4. Updating product:");
        if (product1 != null)
        {
            product1.Price = 1099.99m;
            bool updated = await dal.UpdateProductAsync(product1);
            Console.WriteLine($"   Update result: {(updated ? "Success" : "Failed")}");
        }

        await dal.DisconnectAsync();
    }

    /// <summary>
    /// Demonstrates the flexibility of the Bridge pattern - switching implementations.
    /// </summary>
    private static async Task DemonstrateBridgeFlexibility()
    {
        Console.WriteLine("Creating same abstraction with different implementations:\n");

        // Same abstraction (AdvancedDataAccess), different implementations
        IDatabase[] implementations =
        {
            new SqlServerDatabase(),
            new PostgreSqlDatabase(),
            new MongoDatabase()
        };

        foreach (IDatabase implementation in implementations)
        {
            AdvancedDataAccess advancedDal = new AdvancedDataAccess(implementation);
            await advancedDal.ConnectAsync($"Connection for {implementation.GetDatabaseType()}");

            Console.WriteLine($"\n{implementation.GetDatabaseType()}:");
            await advancedDal.GetTotalInventoryValueAsync();

            await advancedDal.DisconnectAsync();
        }

        Console.WriteLine("\n✓ Same abstraction code works with all implementations!");
    }
}
