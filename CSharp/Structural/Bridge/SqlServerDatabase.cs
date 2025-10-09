using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace Bridge;

/// <summary>
/// Concrete implementation for SQL Server database.
/// This is a "Concrete Implementor" in the Bridge pattern.
/// </summary>
public class SqlServerDatabase : IDatabase
{
    private bool _isConnected = false;
    private bool _inTransaction = false;
    private readonly Dictionary<int, Product> _products = new Dictionary<int, Product>();
    private int _nextId = 1;

    public SqlServerDatabase()
    {
        // Initialize with sample data
        _products[_nextId] = new Product { Id = _nextId, Name = "Laptop", Price = 999.99m, StockQuantity = 50, Category = "Electronics" };
        _nextId++;
        _products[_nextId] = new Product { Id = _nextId, Name = "Mouse", Price = 19.99m, StockQuantity = 200, Category = "Electronics" };
        _nextId++;
        _products[_nextId] = new Product { Id = _nextId, Name = "Keyboard", Price = 49.99m, StockQuantity = 150, Category = "Electronics" };
        _nextId++;
    }

    public Task<bool> ConnectAsync(string connectionString)
    {
        Console.WriteLine($"[SQL Server] Connecting with: {connectionString}");
        _isConnected = true;
        return Task.FromResult(true);
    }

    public Task DisconnectAsync()
    {
        Console.WriteLine("[SQL Server] Disconnecting...");
        _isConnected = false;
        return Task.CompletedTask;
    }

    public Task<T?> ExecuteQueryAsync<T>(string query, Dictionary<string, object> parameters) where T : class
    {
        if (!_isConnected)
        {
            throw new InvalidOperationException("Database not connected");
        }

        Console.WriteLine($"[SQL Server] Executing query: {query}");

        if (typeof(T) == typeof(Product) && parameters.ContainsKey("@Id"))
        {
            int id = Convert.ToInt32(parameters["@Id"]);
            if (_products.ContainsKey(id))
            {
                return Task.FromResult<T?>(_products[id] as T);
            }
        }

        return Task.FromResult<T?>(null);
    }

    public Task<List<T>> ExecuteQueryListAsync<T>(string query, Dictionary<string, object> parameters) where T : class
    {
        if (!_isConnected)
        {
            throw new InvalidOperationException("Database not connected");
        }

        Console.WriteLine($"[SQL Server] Executing list query: {query}");

        if (typeof(T) == typeof(Product))
        {
            List<T> results = _products.Values.Cast<T>().ToList();
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

        Console.WriteLine($"[SQL Server] Executing command: {command}");

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
            _products[newProduct.Id] = newProduct;
            return Task.FromResult(1);
        }
        else if (command.Contains("UPDATE") && parameters.ContainsKey("@Id"))
        {
            int id = Convert.ToInt32(parameters["@Id"]);
            if (_products.ContainsKey(id))
            {
                if (parameters.ContainsKey("@Name"))
                    _products[id].Name = parameters["@Name"].ToString() ?? string.Empty;
                if (parameters.ContainsKey("@Price"))
                    _products[id].Price = Convert.ToDecimal(parameters["@Price"]);
                if (parameters.ContainsKey("@StockQuantity"))
                    _products[id].StockQuantity = Convert.ToInt32(parameters["@StockQuantity"]);
                return Task.FromResult(1);
            }
        }
        else if (command.Contains("DELETE") && parameters.ContainsKey("@Id"))
        {
            int id = Convert.ToInt32(parameters["@Id"]);
            bool removed = _products.Remove(id);
            return Task.FromResult(removed ? 1 : 0);
        }

        return Task.FromResult(0);
    }

    public Task<bool> BeginTransactionAsync()
    {
        Console.WriteLine("[SQL Server] BEGIN TRANSACTION");
        _inTransaction = true;
        return Task.FromResult(true);
    }

    public Task<bool> CommitTransactionAsync()
    {
        if (!_inTransaction)
        {
            throw new InvalidOperationException("No active transaction");
        }

        Console.WriteLine("[SQL Server] COMMIT TRANSACTION");
        _inTransaction = false;
        return Task.FromResult(true);
    }

    public Task<bool> RollbackTransactionAsync()
    {
        if (!_inTransaction)
        {
            throw new InvalidOperationException("No active transaction");
        }

        Console.WriteLine("[SQL Server] ROLLBACK TRANSACTION");
        _inTransaction = false;
        return Task.FromResult(true);
    }

    public string GetDatabaseType()
    {
        return "SQL Server";
    }
}
