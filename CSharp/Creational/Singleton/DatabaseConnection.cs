using System.Data;
using System.Data.SqlClient;
using System.Collections.Concurrent;

namespace Singleton;

/// <summary>
/// Production-ready Database Connection Pool Manager as a Singleton.
/// Manages a pool of SqlConnection objects for efficient database access.
/// Implements connection pooling, health checks, and automatic connection recovery.
/// </summary>
public sealed class DatabaseConnection : IDisposable
{
    private static readonly Lazy<DatabaseConnection> _instance =
        new Lazy<DatabaseConnection>(() => new DatabaseConnection(), LazyThreadSafetyMode.ExecutionAndPublication);

    public static DatabaseConnection Instance => _instance.Value;

    private readonly string _connectionString;
    private readonly ConcurrentBag<SqlConnection> _availableConnections;
    private readonly SemaphoreSlim _connectionSemaphore;
    private readonly int _maxPoolSize;
    private readonly int _minPoolSize;
    private int _totalConnectionsCreated;
    private int _totalQueriesExecuted;
    private readonly object _statsLock = new object();
    private bool _disposed = false;
    private readonly TimeSpan _connectionTimeout = TimeSpan.FromSeconds(30);

    /// <summary>
    /// Private constructor initializes the connection pool.
    /// </summary>
    private DatabaseConnection()
    {
        // In production, this would come from configuration
        _connectionString = "Server=localhost;Database=DesignPatternsDemo;Integrated Security=true;Connection Timeout=30;";
        _maxPoolSize = 10;
        _minPoolSize = 2;

        _availableConnections = new ConcurrentBag<SqlConnection>();
        _connectionSemaphore = new SemaphoreSlim(_maxPoolSize, _maxPoolSize);
        _totalConnectionsCreated = 0;
        _totalQueriesExecuted = 0;

        // Pre-create minimum pool size connections
        InitializeMinimumPool();
    }

    /// <summary>
    /// Initializes minimum number of connections in the pool.
    /// </summary>
    private void InitializeMinimumPool()
    {
        for (int i = 0; i < _minPoolSize; i++)
        {
            SqlConnection connection = CreateNewConnection();
            if (connection != null)
            {
                _availableConnections.Add(connection);
            }
        }
    }

    /// <summary>
    /// Creates a new SqlConnection instance.
    /// </summary>
    private SqlConnection CreateNewConnection()
    {
        try
        {
            SqlConnection connection = new SqlConnection(_connectionString);
            Interlocked.Increment(ref _totalConnectionsCreated);
            return connection;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to create connection: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Gets a connection from the pool or creates a new one.
    /// </summary>
    private async Task<SqlConnection> GetConnectionAsync()
    {
        await _connectionSemaphore.WaitAsync(_connectionTimeout);

        try
        {
            if (_availableConnections.TryTake(out SqlConnection? connection))
            {
                // Validate connection health
                if (connection.State == ConnectionState.Broken || connection.State == ConnectionState.Closed)
                {
                    connection.Dispose();
                    connection = CreateNewConnection();
                }

                if (connection.State != ConnectionState.Open)
                {
                    await connection.OpenAsync();
                }

                return connection;
            }
            else
            {
                // Create new connection if pool is empty
                SqlConnection newConnection = CreateNewConnection();
                await newConnection.OpenAsync();
                return newConnection;
            }
        }
        catch
        {
            _connectionSemaphore.Release();
            throw;
        }
    }

    /// <summary>
    /// Returns a connection to the pool.
    /// </summary>
    private void ReturnConnection(SqlConnection connection)
    {
        if (connection != null && connection.State != ConnectionState.Broken)
        {
            _availableConnections.Add(connection);
        }
        else
        {
            connection?.Dispose();
        }

        _connectionSemaphore.Release();
    }

    /// <summary>
    /// Executes a SQL query and returns the number of affected rows.
    /// </summary>
    public async Task<int> ExecuteNonQueryAsync(string query, Dictionary<string, object>? parameters = null)
    {
        if (_disposed)
        {
            throw new ObjectDisposedException(nameof(DatabaseConnection));
        }

        SqlConnection? connection = null;
        try
        {
            connection = await GetConnectionAsync();

            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.CommandTimeout = 30;

                if (parameters != null)
                {
                    foreach (KeyValuePair<string, object> param in parameters)
                    {
                        command.Parameters.AddWithValue(param.Key, param.Value ?? DBNull.Value);
                    }
                }

                int result = await command.ExecuteNonQueryAsync();

                lock (_statsLock)
                {
                    _totalQueriesExecuted++;
                }

                return result;
            }
        }
        finally
        {
            if (connection != null)
            {
                ReturnConnection(connection);
            }
        }
    }

    /// <summary>
    /// Executes a SQL query and returns a DataTable with results.
    /// </summary>
    public async Task<DataTable> ExecuteQueryAsync(string query, Dictionary<string, object>? parameters = null)
    {
        if (_disposed)
        {
            throw new ObjectDisposedException(nameof(DatabaseConnection));
        }

        SqlConnection? connection = null;
        try
        {
            connection = await GetConnectionAsync();

            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.CommandTimeout = 30;

                if (parameters != null)
                {
                    foreach (KeyValuePair<string, object> param in parameters)
                    {
                        command.Parameters.AddWithValue(param.Key, param.Value ?? DBNull.Value);
                    }
                }

                using (SqlDataAdapter adapter = new SqlDataAdapter(command))
                {
                    DataTable dataTable = new DataTable();
                    adapter.Fill(dataTable);

                    lock (_statsLock)
                    {
                        _totalQueriesExecuted++;
                    }

                    return dataTable;
                }
            }
        }
        finally
        {
            if (connection != null)
            {
                ReturnConnection(connection);
            }
        }
    }

    /// <summary>
    /// Executes a SQL query and returns a scalar value.
    /// </summary>
    public async Task<T?> ExecuteScalarAsync<T>(string query, Dictionary<string, object>? parameters = null)
    {
        if (_disposed)
        {
            throw new ObjectDisposedException(nameof(DatabaseConnection));
        }

        SqlConnection? connection = null;
        try
        {
            connection = await GetConnectionAsync();

            using (SqlCommand command = new SqlCommand(query, connection))
            {
                command.CommandTimeout = 30;

                if (parameters != null)
                {
                    foreach (KeyValuePair<string, object> param in parameters)
                    {
                        command.Parameters.AddWithValue(param.Key, param.Value ?? DBNull.Value);
                    }
                }

                object? result = await command.ExecuteScalarAsync();

                lock (_statsLock)
                {
                    _totalQueriesExecuted++;
                }

                if (result == null || result == DBNull.Value)
                {
                    return default(T);
                }

                return (T)Convert.ChangeType(result, typeof(T));
            }
        }
        finally
        {
            if (connection != null)
            {
                ReturnConnection(connection);
            }
        }
    }

    /// <summary>
    /// Gets connection pool statistics.
    /// </summary>
    public ConnectionPoolStats GetStatistics()
    {
        lock (_statsLock)
        {
            return new ConnectionPoolStats
            {
                TotalConnectionsCreated = _totalConnectionsCreated,
                TotalQueriesExecuted = _totalQueriesExecuted,
                AvailableConnections = _availableConnections.Count,
                MaxPoolSize = _maxPoolSize,
                MinPoolSize = _minPoolSize
            };
        }
    }

    /// <summary>
    /// Tests database connectivity.
    /// </summary>
    public async Task<bool> TestConnectionAsync()
    {
        try
        {
            int result = await ExecuteScalarAsync<int>("SELECT 1");
            return result == 1;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Disposes all connections in the pool.
    /// </summary>
    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;

        while (_availableConnections.TryTake(out SqlConnection? connection))
        {
            connection?.Dispose();
        }

        _connectionSemaphore.Dispose();
    }
}

/// <summary>
/// Statistics for the connection pool.
/// </summary>
public class ConnectionPoolStats
{
    public int TotalConnectionsCreated { get; set; }
    public int TotalQueriesExecuted { get; set; }
    public int AvailableConnections { get; set; }
    public int MaxPoolSize { get; set; }
    public int MinPoolSize { get; set; }
}
