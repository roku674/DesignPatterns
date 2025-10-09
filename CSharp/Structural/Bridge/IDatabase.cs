using System.Threading.Tasks;
using System.Collections.Generic;

namespace Bridge;

/// <summary>
/// Implementation interface for database operations.
/// This is the "Implementor" in the Bridge pattern.
/// Different database systems implement this interface.
/// </summary>
public interface IDatabase
{
    Task<bool> ConnectAsync(string connectionString);
    Task DisconnectAsync();
    Task<T?> ExecuteQueryAsync<T>(string query, Dictionary<string, object> parameters) where T : class;
    Task<List<T>> ExecuteQueryListAsync<T>(string query, Dictionary<string, object> parameters) where T : class;
    Task<int> ExecuteNonQueryAsync(string command, Dictionary<string, object> parameters);
    Task<bool> BeginTransactionAsync();
    Task<bool> CommitTransactionAsync();
    Task<bool> RollbackTransactionAsync();
    string GetDatabaseType();
}

/// <summary>
/// Common entity model for database operations.
/// </summary>
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string Category { get; set; } = string.Empty;
}
