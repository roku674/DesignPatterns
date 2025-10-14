using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;

namespace Enterprise.BasePatterns.Gateway;

/// <summary>
/// Gateway for accessing external API services.
/// Encapsulates all communication with external REST APIs.
/// </summary>
public class ExternalApiGateway
{
    private readonly string _baseUrl;
    private readonly string _apiKey;
    private readonly Dictionary<string, string> _cache;
    private readonly int _timeoutMs;
    private int _requestCount;

    /// <summary>
    /// Initializes a new instance of ExternalApiGateway.
    /// </summary>
    /// <param name="baseUrl">Base URL of the external API.</param>
    /// <param name="apiKey">API key for authentication.</param>
    /// <param name="timeoutMs">Request timeout in milliseconds.</param>
    public ExternalApiGateway(string baseUrl, string apiKey, int timeoutMs = 5000)
    {
        _baseUrl = baseUrl ?? throw new ArgumentNullException(nameof(baseUrl));
        _apiKey = apiKey ?? throw new ArgumentNullException(nameof(apiKey));
        _timeoutMs = timeoutMs;
        _cache = new Dictionary<string, string>();
        _requestCount = 0;
    }

    /// <summary>
    /// Gets data from the external API.
    /// </summary>
    /// <param name="endpoint">API endpoint path.</param>
    /// <returns>Response data as string.</returns>
    public string GetData(string endpoint)
    {
        string cacheKey = $"GET:{endpoint}";

        if (_cache.ContainsKey(cacheKey))
        {
            Console.WriteLine($"  [CACHE HIT] {endpoint}");
            return _cache[cacheKey];
        }

        Console.WriteLine($"  [API CALL] GET {_baseUrl}{endpoint}");

        // Simulate API call
        Thread.Sleep(100); // Simulated network latency
        _requestCount++;

        string response = SimulateApiResponse(endpoint);
        _cache[cacheKey] = response;

        return response;
    }

    /// <summary>
    /// Posts data to the external API.
    /// </summary>
    /// <param name="endpoint">API endpoint path.</param>
    /// <param name="data">Data to post.</param>
    /// <returns>Response data as string.</returns>
    public string PostData(string endpoint, string data)
    {
        Console.WriteLine($"  [API CALL] POST {_baseUrl}{endpoint}");
        Console.WriteLine($"  [DATA] {data}");

        // Simulate API call
        Thread.Sleep(100); // Simulated network latency
        _requestCount++;

        return SimulateApiResponse(endpoint, data);
    }

    /// <summary>
    /// Updates data via the external API.
    /// </summary>
    /// <param name="endpoint">API endpoint path.</param>
    /// <param name="data">Data to update.</param>
    /// <returns>Response data as string.</returns>
    public string UpdateData(string endpoint, string data)
    {
        Console.WriteLine($"  [API CALL] PUT {_baseUrl}{endpoint}");
        Console.WriteLine($"  [DATA] {data}");

        // Invalidate cache for this endpoint
        string cacheKey = $"GET:{endpoint}";
        if (_cache.ContainsKey(cacheKey))
        {
            _cache.Remove(cacheKey);
            Console.WriteLine($"  [CACHE INVALIDATED] {endpoint}");
        }

        // Simulate API call
        Thread.Sleep(100); // Simulated network latency
        _requestCount++;

        return SimulateApiResponse(endpoint, data);
    }

    /// <summary>
    /// Deletes data via the external API.
    /// </summary>
    /// <param name="endpoint">API endpoint path.</param>
    /// <returns>True if deletion was successful.</returns>
    public bool DeleteData(string endpoint)
    {
        Console.WriteLine($"  [API CALL] DELETE {_baseUrl}{endpoint}");

        // Invalidate cache
        string cacheKey = $"GET:{endpoint}";
        if (_cache.ContainsKey(cacheKey))
        {
            _cache.Remove(cacheKey);
        }

        // Simulate API call
        Thread.Sleep(100); // Simulated network latency
        _requestCount++;

        return true;
    }

    /// <summary>
    /// Gets the total number of API requests made.
    /// </summary>
    /// <returns>Request count.</returns>
    public int GetRequestCount()
    {
        return _requestCount;
    }

    /// <summary>
    /// Clears the internal cache.
    /// </summary>
    public void ClearCache()
    {
        _cache.Clear();
        Console.WriteLine("  [CACHE CLEARED]");
    }

    /// <summary>
    /// Simulates an API response.
    /// </summary>
    /// <param name="endpoint">Endpoint path.</param>
    /// <param name="data">Optional data for POST/PUT requests.</param>
    /// <returns>Simulated response.</returns>
    private string SimulateApiResponse(string endpoint, string? data = null)
    {
        if (endpoint.Contains("/users"))
        {
            return "{\"id\": 123, \"name\": \"John Doe\", \"email\": \"john@example.com\"}";
        }
        else if (endpoint.Contains("/products"))
        {
            return "{\"id\": 456, \"name\": \"Widget\", \"price\": 29.99}";
        }
        else if (endpoint.Contains("/orders"))
        {
            return "{\"id\": 789, \"total\": 149.95, \"status\": \"shipped\"}";
        }

        return $"{{\"message\": \"Success\", \"endpoint\": \"{endpoint}\"}}";
    }
}

/// <summary>
/// Gateway for accessing database operations.
/// Encapsulates all database communication.
/// </summary>
public class DatabaseGateway
{
    private readonly string _connectionString;
    private readonly Dictionary<int, Dictionary<string, object>> _dataStore;
    private int _nextId;
    private bool _isConnected;

    /// <summary>
    /// Initializes a new instance of DatabaseGateway.
    /// </summary>
    /// <param name="connectionString">Database connection string.</param>
    public DatabaseGateway(string connectionString)
    {
        _connectionString = connectionString ?? throw new ArgumentNullException(nameof(connectionString));
        _dataStore = new Dictionary<int, Dictionary<string, object>>();
        _nextId = 1;
        _isConnected = false;
    }

    /// <summary>
    /// Opens the database connection.
    /// </summary>
    public void Connect()
    {
        if (_isConnected)
        {
            throw new InvalidOperationException("Already connected to database.");
        }

        Console.WriteLine($"  [DB] Connecting to: {_connectionString}");
        Thread.Sleep(50); // Simulate connection time
        _isConnected = true;
        Console.WriteLine("  [DB] Connected successfully");
    }

    /// <summary>
    /// Closes the database connection.
    /// </summary>
    public void Disconnect()
    {
        if (!_isConnected)
        {
            throw new InvalidOperationException("Not connected to database.");
        }

        Console.WriteLine("  [DB] Disconnecting...");
        _isConnected = false;
        Console.WriteLine("  [DB] Disconnected");
    }

    /// <summary>
    /// Inserts a record into the database.
    /// </summary>
    /// <param name="tableName">Table name.</param>
    /// <param name="data">Data to insert.</param>
    /// <returns>ID of the inserted record.</returns>
    public int Insert(string tableName, Dictionary<string, object> data)
    {
        EnsureConnected();

        int id = _nextId++;
        Dictionary<string, object> record = new Dictionary<string, object>(data)
        {
            ["_table"] = tableName,
            ["_id"] = id
        };

        _dataStore[id] = record;
        Console.WriteLine($"  [DB] INSERT into {tableName}: ID={id}");

        return id;
    }

    /// <summary>
    /// Finds a record by ID.
    /// </summary>
    /// <param name="id">Record ID.</param>
    /// <returns>Record data or null if not found.</returns>
    public Dictionary<string, object>? FindById(int id)
    {
        EnsureConnected();

        if (_dataStore.ContainsKey(id))
        {
            Console.WriteLine($"  [DB] SELECT: ID={id} FOUND");
            return new Dictionary<string, object>(_dataStore[id]);
        }

        Console.WriteLine($"  [DB] SELECT: ID={id} NOT FOUND");
        return null;
    }

    /// <summary>
    /// Updates a record in the database.
    /// </summary>
    /// <param name="id">Record ID.</param>
    /// <param name="data">Updated data.</param>
    /// <returns>True if update was successful.</returns>
    public bool Update(int id, Dictionary<string, object> data)
    {
        EnsureConnected();

        if (!_dataStore.ContainsKey(id))
        {
            Console.WriteLine($"  [DB] UPDATE: ID={id} NOT FOUND");
            return false;
        }

        foreach (KeyValuePair<string, object> kvp in data)
        {
            _dataStore[id][kvp.Key] = kvp.Value;
        }

        Console.WriteLine($"  [DB] UPDATE: ID={id} SUCCESS");
        return true;
    }

    /// <summary>
    /// Deletes a record from the database.
    /// </summary>
    /// <param name="id">Record ID.</param>
    /// <returns>True if deletion was successful.</returns>
    public bool Delete(int id)
    {
        EnsureConnected();

        if (_dataStore.Remove(id))
        {
            Console.WriteLine($"  [DB] DELETE: ID={id} SUCCESS");
            return true;
        }

        Console.WriteLine($"  [DB] DELETE: ID={id} NOT FOUND");
        return false;
    }

    /// <summary>
    /// Finds records by table name.
    /// </summary>
    /// <param name="tableName">Table name.</param>
    /// <returns>List of records.</returns>
    public List<Dictionary<string, object>> FindByTable(string tableName)
    {
        EnsureConnected();

        List<Dictionary<string, object>> results = _dataStore.Values
            .Where(record => record["_table"].ToString() == tableName)
            .Select(record => new Dictionary<string, object>(record))
            .ToList();

        Console.WriteLine($"  [DB] SELECT from {tableName}: {results.Count} records found");
        return results;
    }

    /// <summary>
    /// Executes a raw query (simulated).
    /// </summary>
    /// <param name="query">SQL query.</param>
    /// <returns>Number of affected rows.</returns>
    public int ExecuteQuery(string query)
    {
        EnsureConnected();

        Console.WriteLine($"  [DB] EXECUTE: {query}");
        Thread.Sleep(10); // Simulate query execution
        return 1; // Simulated affected rows
    }

    /// <summary>
    /// Ensures the gateway is connected.
    /// </summary>
    private void EnsureConnected()
    {
        if (!_isConnected)
        {
            throw new InvalidOperationException("Not connected to database. Call Connect() first.");
        }
    }
}

/// <summary>
/// Gateway for accessing file system operations.
/// Encapsulates all file system interactions.
/// </summary>
public class FileSystemGateway
{
    private readonly string _basePath;
    private readonly Dictionary<string, string> _virtualFileSystem;

    /// <summary>
    /// Initializes a new instance of FileSystemGateway.
    /// </summary>
    /// <param name="basePath">Base path for file operations.</param>
    public FileSystemGateway(string basePath)
    {
        _basePath = basePath ?? throw new ArgumentNullException(nameof(basePath));
        _virtualFileSystem = new Dictionary<string, string>();
    }

    /// <summary>
    /// Reads a file from the file system.
    /// </summary>
    /// <param name="fileName">File name.</param>
    /// <returns>File contents.</returns>
    public string ReadFile(string fileName)
    {
        string fullPath = GetFullPath(fileName);

        if (!_virtualFileSystem.ContainsKey(fullPath))
        {
            throw new FileNotFoundException($"File not found: {fullPath}");
        }

        Console.WriteLine($"  [FS] READ: {fullPath}");
        return _virtualFileSystem[fullPath];
    }

    /// <summary>
    /// Writes data to a file.
    /// </summary>
    /// <param name="fileName">File name.</param>
    /// <param name="content">Content to write.</param>
    public void WriteFile(string fileName, string content)
    {
        string fullPath = GetFullPath(fileName);
        _virtualFileSystem[fullPath] = content;
        Console.WriteLine($"  [FS] WRITE: {fullPath} ({content.Length} bytes)");
    }

    /// <summary>
    /// Checks if a file exists.
    /// </summary>
    /// <param name="fileName">File name.</param>
    /// <returns>True if file exists.</returns>
    public bool FileExists(string fileName)
    {
        string fullPath = GetFullPath(fileName);
        bool exists = _virtualFileSystem.ContainsKey(fullPath);
        Console.WriteLine($"  [FS] EXISTS: {fullPath} = {exists}");
        return exists;
    }

    /// <summary>
    /// Deletes a file.
    /// </summary>
    /// <param name="fileName">File name.</param>
    /// <returns>True if deletion was successful.</returns>
    public bool DeleteFile(string fileName)
    {
        string fullPath = GetFullPath(fileName);
        bool deleted = _virtualFileSystem.Remove(fullPath);
        Console.WriteLine($"  [FS] DELETE: {fullPath} = {deleted}");
        return deleted;
    }

    /// <summary>
    /// Lists all files in the virtual file system.
    /// </summary>
    /// <returns>List of file paths.</returns>
    public List<string> ListFiles()
    {
        List<string> files = _virtualFileSystem.Keys.ToList();
        Console.WriteLine($"  [FS] LIST: {files.Count} files");
        return files;
    }

    /// <summary>
    /// Gets the full path for a file.
    /// </summary>
    /// <param name="fileName">File name.</param>
    /// <returns>Full path.</returns>
    private string GetFullPath(string fileName)
    {
        return $"{_basePath}/{fileName}";
    }
}

/// <summary>
/// Exception thrown when a file is not found.
/// </summary>
public class FileNotFoundException : Exception
{
    public FileNotFoundException(string message) : base(message) { }
}
