namespace Singleton;

/// <summary>
/// Real-world example: Database Connection Manager as a Singleton.
/// Ensures only one database connection pool exists in the application.
/// </summary>
public sealed class DatabaseConnection
{
    private static readonly Lazy<DatabaseConnection> _instance =
        new Lazy<DatabaseConnection>(() => new DatabaseConnection());

    public static DatabaseConnection Instance => _instance.Value;

    private readonly string _connectionString;
    private readonly Dictionary<string, object> _connectionPool;
    private int _connectionCount;

    /// <summary>
    /// Private constructor initializes the database connection.
    /// </summary>
    private DatabaseConnection()
    {
        _connectionString = "Server=localhost;Database=MyApp;";
        _connectionPool = new Dictionary<string, object>();
        _connectionCount = 0;

        Console.WriteLine("DatabaseConnection: Initializing connection pool...");
        Console.WriteLine($"DatabaseConnection: Connected to {_connectionString}");
    }

    /// <summary>
    /// Executes a query using the connection pool.
    /// </summary>
    public void ExecuteQuery(string query)
    {
        _connectionCount++;
        Console.WriteLine($"DatabaseConnection: Executing query #{_connectionCount}: {query}");
    }

    /// <summary>
    /// Gets connection statistics.
    /// </summary>
    public void GetStatistics()
    {
        Console.WriteLine($"DatabaseConnection: Total queries executed: {_connectionCount}");
        Console.WriteLine($"DatabaseConnection: Connection string: {_connectionString}");
    }

    /// <summary>
    /// Closes the database connection.
    /// In real applications, this might be called during application shutdown.
    /// </summary>
    public void CloseConnection()
    {
        Console.WriteLine("DatabaseConnection: Closing connection pool...");
    }
}
