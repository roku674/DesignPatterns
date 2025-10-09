using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace Bridge;

/// <summary>
/// Concrete implementation for MongoDB (NoSQL) database.
/// Demonstrates how the Bridge pattern allows radically different implementations
/// (SQL vs NoSQL) while maintaining the same abstraction interface.
/// </summary>
public class MongoDatabase : IDatabase
{
    private bool _isConnected = false;
    private readonly Dictionary<string, List<Product>> _collections = new Dictionary<string, List<Product>>();
    private int _nextId = 1;

    public MongoDatabase()
    {
        // Initialize collections
        _collections["products"] = new List<Product>
        {
            new Product { Id = _nextId++, Name = "Notebook", Price = 2.99m, StockQuantity = 500, Category = "Office" },
            new Product { Id = _nextId++, Name = "Pen", Price = 1.49m, StockQuantity = 1000, Category = "Office" },
            new Product { Id = _nextId++, Name = "Stapler", Price = 8.99m, StockQuantity = 120, Category = "Office" }
        };
    }

    public Task<bool> ConnectAsync(string connectionString)
    {
        Console.WriteLine($"[MongoDB] Connecting to cluster: {connectionString}");
        _isConnected = true;
        return Task.FromResult(true);
    }

    public Task DisconnectAsync()
    {
        Console.WriteLine("[MongoDB] Closing connection...");
        _isConnected = false;
        return Task.CompletedTask;
    }

    public Task<T?> ExecuteQueryAsync<T>(string query, Dictionary<string, object> parameters) where T : class
    {
        if (!_isConnected)
        {
            throw new InvalidOperationException("Database not connected");
        }

        // Simulating MongoDB find operation
        Console.WriteLine($"[MongoDB] db.products.findOne({query})");

        if (typeof(T) == typeof(Product) && parameters.ContainsKey("@Id"))
        {
            int id = Convert.ToInt32(parameters["@Id"]);
            Product? product = _collections["products"].FirstOrDefault(p => p.Id == id);
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

        // Simulating MongoDB find operation
        Console.WriteLine($"[MongoDB] db.products.find({query})");

        if (typeof(T) == typeof(Product))
        {
            List<T> results = _collections["products"].Cast<T>().ToList();
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

        if (command.Contains("INSERT") && parameters.ContainsKey("@Name"))
        {
            Console.WriteLine($"[MongoDB] db.products.insertOne(...)");
            Product newProduct = new Product
            {
                Id = _nextId++,
                Name = parameters["@Name"].ToString() ?? string.Empty,
                Price = Convert.ToDecimal(parameters["@Price"]),
                StockQuantity = Convert.ToInt32(parameters["@StockQuantity"]),
                Category = parameters["@Category"].ToString() ?? string.Empty
            };
            _collections["products"].Add(newProduct);
            return Task.FromResult(1);
        }
        else if (command.Contains("UPDATE") && parameters.ContainsKey("@Id"))
        {
            Console.WriteLine($"[MongoDB] db.products.updateOne(...)");
            int id = Convert.ToInt32(parameters["@Id"]);
            Product? product = _collections["products"].FirstOrDefault(p => p.Id == id);
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
            Console.WriteLine($"[MongoDB] db.products.deleteOne(...)");
            int id = Convert.ToInt32(parameters["@Id"]);
            Product? product = _collections["products"].FirstOrDefault(p => p.Id == id);
            if (product != null)
            {
                _collections["products"].Remove(product);
                return Task.FromResult(1);
            }
        }

        return Task.FromResult(0);
    }

    public Task<bool> BeginTransactionAsync()
    {
        Console.WriteLine("[MongoDB] Starting session with transaction...");
        return Task.FromResult(true);
    }

    public Task<bool> CommitTransactionAsync()
    {
        Console.WriteLine("[MongoDB] Committing transaction...");
        return Task.FromResult(true);
    }

    public Task<bool> RollbackTransactionAsync()
    {
        Console.WriteLine("[MongoDB] Aborting transaction...");
        return Task.FromResult(true);
    }

    public string GetDatabaseType()
    {
        return "MongoDB";
    }
}
