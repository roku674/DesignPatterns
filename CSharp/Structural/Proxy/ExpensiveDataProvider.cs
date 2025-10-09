using System.Threading.Tasks;
using System.Collections.Generic;

namespace Proxy;

/// <summary>
/// RealSubject - expensive service that we want to proxy.
/// Simulates slow database or external API operations.
/// </summary>
public class ExpensiveDataProvider : IDataProvider
{
    private readonly Dictionary<string, string> _data = new Dictionary<string, string>();
    private long _operationCount = 0;

    public ExpensiveDataProvider()
    {
        Console.WriteLine("[RealSubject] ExpensiveDataProvider initialized (heavy resource allocation)");

        // Initialize with sample data
        _data["user:1"] = "John Doe";
        _data["user:2"] = "Jane Smith";
        _data["product:1"] = "Laptop";
        _data["product:2"] = "Mouse";
        _data["config:timeout"] = "30";
    }

    public async Task<string> GetDataAsync(string key)
    {
        _operationCount++;
        await Task.Delay(500); // Simulate expensive database query
        Console.WriteLine($"[RealSubject] Expensive GET operation for key: {key} (500ms delay)");

        return _data.ContainsKey(key) ? _data[key] : string.Empty;
    }

    public async Task<List<string>> GetAllKeysAsync()
    {
        _operationCount++;
        await Task.Delay(1000); // Simulate expensive operation
        Console.WriteLine($"[RealSubject] Expensive GET ALL KEYS operation (1000ms delay)");

        return new List<string>(_data.Keys);
    }

    public async Task SetDataAsync(string key, string value)
    {
        _operationCount++;
        await Task.Delay(300); // Simulate database write
        Console.WriteLine($"[RealSubject] Expensive SET operation for key: {key} (300ms delay)");

        _data[key] = value;
    }

    public async Task<bool> DeleteDataAsync(string key)
    {
        _operationCount++;
        await Task.Delay(300); // Simulate database delete
        Console.WriteLine($"[RealSubject] Expensive DELETE operation for key: {key} (300ms delay)");

        return _data.Remove(key);
    }

    public long GetOperationCount()
    {
        return _operationCount;
    }
}
