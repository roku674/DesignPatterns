using System.Threading.Tasks;
using System.Collections.Generic;

namespace Proxy;

/// <summary>
/// Subject interface that both RealSubject and Proxy implement.
/// </summary>
public interface IDataProvider
{
    Task<string> GetDataAsync(string key);
    Task<List<string>> GetAllKeysAsync();
    Task SetDataAsync(string key, string value);
    Task<bool> DeleteDataAsync(string key);
    long GetOperationCount();
}
