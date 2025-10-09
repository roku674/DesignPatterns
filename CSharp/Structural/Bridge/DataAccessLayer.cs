using System.Threading.Tasks;
using System.Collections.Generic;

namespace Bridge;

/// <summary>
/// Abstraction in the Bridge pattern.
/// Provides high-level data access operations independent of the database implementation.
/// </summary>
public abstract class DataAccessLayer
{
    protected readonly IDatabase _database;

    protected DataAccessLayer(IDatabase database)
    {
        _database = database ?? throw new ArgumentNullException(nameof(database));
    }

    public abstract Task<bool> ConnectAsync(string connectionString);
    public abstract Task DisconnectAsync();
    public abstract Task<Product?> GetProductByIdAsync(int id);
    public abstract Task<List<Product>> GetAllProductsAsync();
    public abstract Task<bool> AddProductAsync(Product product);
    public abstract Task<bool> UpdateProductAsync(Product product);
    public abstract Task<bool> DeleteProductAsync(int id);

    public string GetImplementationType()
    {
        return _database.GetDatabaseType();
    }
}

/// <summary>
/// Refined Abstraction - Basic data access with simple operations.
/// </summary>
public class BasicDataAccess : DataAccessLayer
{
    public BasicDataAccess(IDatabase database) : base(database)
    {
    }

    public override async Task<bool> ConnectAsync(string connectionString)
    {
        return await _database.ConnectAsync(connectionString);
    }

    public override async Task DisconnectAsync()
    {
        await _database.DisconnectAsync();
    }

    public override async Task<Product?> GetProductByIdAsync(int id)
    {
        Dictionary<string, object> parameters = new Dictionary<string, object>
        {
            { "@Id", id }
        };

        return await _database.ExecuteQueryAsync<Product>(
            $"SELECT * FROM Products WHERE Id = @Id",
            parameters
        );
    }

    public override async Task<List<Product>> GetAllProductsAsync()
    {
        return await _database.ExecuteQueryListAsync<Product>(
            "SELECT * FROM Products",
            new Dictionary<string, object>()
        );
    }

    public override async Task<bool> AddProductAsync(Product product)
    {
        Dictionary<string, object> parameters = new Dictionary<string, object>
        {
            { "@Name", product.Name },
            { "@Price", product.Price },
            { "@StockQuantity", product.StockQuantity },
            { "@Category", product.Category }
        };

        int result = await _database.ExecuteNonQueryAsync(
            "INSERT INTO Products (Name, Price, StockQuantity, Category) VALUES (@Name, @Price, @StockQuantity, @Category)",
            parameters
        );

        return result > 0;
    }

    public override async Task<bool> UpdateProductAsync(Product product)
    {
        Dictionary<string, object> parameters = new Dictionary<string, object>
        {
            { "@Id", product.Id },
            { "@Name", product.Name },
            { "@Price", product.Price },
            { "@StockQuantity", product.StockQuantity }
        };

        int result = await _database.ExecuteNonQueryAsync(
            "UPDATE Products SET Name = @Name, Price = @Price, StockQuantity = @StockQuantity WHERE Id = @Id",
            parameters
        );

        return result > 0;
    }

    public override async Task<bool> DeleteProductAsync(int id)
    {
        Dictionary<string, object> parameters = new Dictionary<string, object>
        {
            { "@Id", id }
        };

        int result = await _database.ExecuteNonQueryAsync(
            "DELETE FROM Products WHERE Id = @Id",
            parameters
        );

        return result > 0;
    }
}

/// <summary>
/// Refined Abstraction - Advanced data access with transaction support and bulk operations.
/// </summary>
public class AdvancedDataAccess : BasicDataAccess
{
    public AdvancedDataAccess(IDatabase database) : base(database)
    {
    }

    /// <summary>
    /// Performs bulk insert within a transaction for data integrity.
    /// </summary>
    public async Task<bool> BulkAddProductsAsync(List<Product> products)
    {
        try
        {
            await _database.BeginTransactionAsync();
            Console.WriteLine($"[{GetImplementationType()}] Starting bulk insert of {products.Count} products");

            foreach (Product product in products)
            {
                bool success = await AddProductAsync(product);
                if (!success)
                {
                    await _database.RollbackTransactionAsync();
                    Console.WriteLine($"[{GetImplementationType()}] Bulk insert failed - rolled back");
                    return false;
                }
            }

            await _database.CommitTransactionAsync();
            Console.WriteLine($"[{GetImplementationType()}] Bulk insert successful");
            return true;
        }
        catch (Exception ex)
        {
            await _database.RollbackTransactionAsync();
            Console.WriteLine($"[{GetImplementationType()}] Error during bulk insert: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Updates product price with transaction support.
    /// </summary>
    public async Task<bool> UpdateProductPriceAsync(int productId, decimal newPrice)
    {
        try
        {
            await _database.BeginTransactionAsync();

            Product? product = await GetProductByIdAsync(productId);
            if (product == null)
            {
                await _database.RollbackTransactionAsync();
                return false;
            }

            decimal oldPrice = product.Price;
            product.Price = newPrice;

            bool success = await UpdateProductAsync(product);
            if (success)
            {
                await _database.CommitTransactionAsync();
                Console.WriteLine($"[{GetImplementationType()}] Price updated: ${oldPrice} → ${newPrice}");
                return true;
            }

            await _database.RollbackTransactionAsync();
            return false;
        }
        catch (Exception)
        {
            await _database.RollbackTransactionAsync();
            return false;
        }
    }

    /// <summary>
    /// Gets products by category with filtering.
    /// </summary>
    public async Task<List<Product>> GetProductsByCategoryAsync(string category)
    {
        List<Product> allProducts = await GetAllProductsAsync();
        List<Product> filtered = new List<Product>();

        foreach (Product product in allProducts)
        {
            if (product.Category.Equals(category, StringComparison.OrdinalIgnoreCase))
            {
                filtered.Add(product);
            }
        }

        Console.WriteLine($"[{GetImplementationType()}] Found {filtered.Count} products in category '{category}'");
        return filtered;
    }

    /// <summary>
    /// Calculates total inventory value.
    /// </summary>
    public async Task<decimal> GetTotalInventoryValueAsync()
    {
        List<Product> allProducts = await GetAllProductsAsync();
        decimal total = 0;

        foreach (Product product in allProducts)
        {
            total += product.Price * product.StockQuantity;
        }

        Console.WriteLine($"[{GetImplementationType()}] Total inventory value: ${total:F2}");
        return total;
    }
}
