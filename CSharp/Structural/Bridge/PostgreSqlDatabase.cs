using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace Bridge;

/// <summary>
/// Concrete implementation for PostgreSQL database.
/// This is another "Concrete Implementor" in the Bridge pattern.
/// Shows how different implementations can be swapped without changing abstraction.
/// </summary>
public class PostgreSqlDatabase : IDatabase
{
    private bool _isConnected = false;
    private bool _inTransaction = false;
    private readonly List<Product> _products = new List<Product>();
    private int _nextId = 1;

    public PostgreSqlDatabase()
    {
        // Initialize with sample data
        _products.Add(new Product { Id = _nextId++, Name = "Monitor", Price = 299.99m, StockQuantity = 75, Category = "Electronics" });
        _products.Add(new Product { Id = _nextId++, Name = "Desk", Price = 199.99m, StockQuantity = 30, Category = "Furniture" });
        _products.Add(new Product { Id = _nextId++, Name = "Chair", Price = 149.99m, StockQuantity = 45, Category = "Furniture" });
    }

    public Task<bool> ConnectAsync(string connectionString)
    {
        Console.WriteLine($"[PostgreSQL] Connecting with: {connectionString}");
        _isConnected = true;
        return Task.FromResult(true);
    }

    public Task DisconnectAsync()
    {
        Console.WriteLine("[PostgreSQL] Disconnecting...");
        _isConnected = false;
        return Task.CompletedTask;
    }

    public Task<T?> ExecuteQueryAsync<T>(string query, Dictionary<string, object> parameters) where T : class
    {
        if (!_isConnected)
        {
            throw new InvalidOperationException("Database not connected");
        }

        Console.WriteLine($"[PostgreSQL] Executing query: {query}");

        if (typeof(T) == typeof(Product) && parameters.ContainsKey("@Id"))
        {
            int id = Convert.ToInt32(parameters["@Id"]);
            Product? product = _products.FirstOrDefault(p => p.Id == id);
            return Task.FromResult<T?>(product as T);
        }

        return Task.FromResult<T?>(null);
    }

    public Task<List<T>> ExecuteQueryListAsync<T>(string query, Dictionary<string, object> parameters) where T : class
    {
        if (!_isConnected)
        {
            throw new InvalidOperationException("Database not connected");
        }

        Console.WriteLine($"[PostgreSQL] Executing list query: {query}");

        if (typeof(T) == typeof(Product))
        {
            List<T> results = _products.Cast<T>().ToList();
            return Task.FromResult(results);
        }

        return Task.FromResult(new List<T>());
    }

    public Task<int> ExecuteNonQueryAsync(string command, Dictionary<string, object> parameters)
    {
        if (!_isConnected)
        {
            throw new InvalidOperationException("Database not connected");
        }

        Console.WriteLine($"[PostgreSQL] Executing command: {command}");

        if (command.Contains("INSERT") && parameters.ContainsKey("@Name"))
        {
            Product newProduct = new Product
            {
                Id = _nextId++,
                Name = parameters["@Name"].ToString() ?? string.Empty,
                Price = Convert.ToDecimal(parameters["@Price"]),
                StockQuantity = Convert.ToInt32(parameters["@StockQuantity"]),
                Category = parameters["@Category"].ToString() ?? string.Empty
            };
            _products.Add(newProduct);
            return Task.FromResult(1);
        }
        else if (command.Contains("UPDATE") && parameters.ContainsKey("@Id"))
        {
            int id = Convert.ToInt32(parameters["@Id"]);
            Product? product = _products.FirstOrDefault(p => p.Id == id);
            if (product != null)
            {
                if (parameters.ContainsKey("@Name"))
                    product.Name = parameters["@Name"].ToString() ?? string.Empty;
                if (parameters.ContainsKey("@Price"))
                    product.Price = Convert.ToDecimal(parameters["@Price"]);
                if (parameters.ContainsKey("@StockQuantity"))
                    product.StockQuantity = Convert.ToInt32(parameters["@StockQuantity"]);
                return Task.FromResult(1);
            }
        }
        else if (command.Contains("DELETE") && parameters.ContainsKey("@Id"))
        {
            int id = Convert.ToInt32(parameters["@Id"]);
            Product? product = _products.FirstOrDefault(p => p.Id == id);
            if (product != null)
            {
                _products.Remove(product);
                return Task.FromResult(1);
            }
        }

        return Task.FromResult(0);
    }

    public Task<bool> BeginTransactionAsync()
    {
        Console.WriteLine("[PostgreSQL] BEGIN");
        _inTransaction = true;
        return Task.FromResult(true);
    }

    public Task<bool> CommitTransactionAsync()
    {
        if (!_inTransaction)
        {
            throw new InvalidOperationException("No active transaction");
        }

        Console.WriteLine("[PostgreSQL] COMMIT");
        _inTransaction = false;
        return Task.FromResult(true);
    }

    public Task<bool> RollbackTransactionAsync()
    {
        if (!_inTransaction)
        {
            throw new InvalidOperationException("No active transaction");
        }

        Console.WriteLine("[PostgreSQL] ROLLBACK");
        _inTransaction = false;
        return Task.FromResult(true);
    }

    public string GetDatabaseType()
    {
        return "PostgreSQL";
    }
}
