using System.Threading.Tasks;
using System.Collections.Generic;

namespace Proxy;

/// <summary>
/// Protection Proxy that adds access control and validation.
/// </summary>
public class ProtectionProxy : IDataProvider
{
    private readonly IDataProvider _realProvider;
    private readonly string _userRole;
    private long _operationCount = 0;
    private long _deniedOperations = 0;

    public ProtectionProxy(IDataProvider realProvider, string userRole)
    {
        _realProvider = realProvider ?? throw new ArgumentNullException(nameof(realProvider));
        _userRole = userRole;

        Console.WriteLine($"[ProtectionProxy] Created with role: {userRole}");
    }

    public async Task<string> GetDataAsync(string key)
    {
        _operationCount++;

        if (!CanRead())
        {
            _deniedOperations++;
            Console.WriteLine($"[ProtectionProxy] ACCESS DENIED: {_userRole} cannot READ");
            throw new UnauthorizedAccessException($"Role '{_userRole}' does not have read permission");
        }

        Console.WriteLine($"[ProtectionProxy] Access granted for READ");
        return await _realProvider.GetDataAsync(key);
    }

    public async Task<List<string>> GetAllKeysAsync()
    {
        _operationCount++;

        if (!CanRead())
        {
            _deniedOperations++;
            Console.WriteLine($"[ProtectionProxy] ACCESS DENIED: {_userRole} cannot READ");
            throw new UnauthorizedAccessException($"Role '{_userRole}' does not have read permission");
        }

        Console.WriteLine($"[ProtectionProxy] Access granted for READ ALL");
        return await _realProvider.GetAllKeysAsync();
    }

    public async Task SetDataAsync(string key, string value)
    {
        _operationCount++;

        if (!CanWrite())
        {
            _deniedOperations++;
            Console.WriteLine($"[ProtectionProxy] ACCESS DENIED: {_userRole} cannot WRITE");
            throw new UnauthorizedAccessException($"Role '{_userRole}' does not have write permission");
        }

        // Validate input
        if (string.IsNullOrWhiteSpace(key))
        {
            throw new ArgumentException("Key cannot be empty");
        }

        Console.WriteLine($"[ProtectionProxy] Access granted for WRITE");
        await _realProvider.SetDataAsync(key, value);
    }

    public async Task<bool> DeleteDataAsync(string key)
    {
        _operationCount++;

        if (!CanDelete())
        {
            _deniedOperations++;
            Console.WriteLine($"[ProtectionProxy] ACCESS DENIED: {_userRole} cannot DELETE");
            throw new UnauthorizedAccessException($"Role '{_userRole}' does not have delete permission");
        }

        Console.WriteLine($"[ProtectionProxy] Access granted for DELETE");
        return await _realProvider.DeleteDataAsync(key);
    }

    public long GetOperationCount()
    {
        return _operationCount;
    }

    public long GetDeniedOperations()
    {
        return _deniedOperations;
    }

    private bool CanRead()
    {
        // Admin and User can read, Guest cannot
        return _userRole.Equals("Admin", StringComparison.OrdinalIgnoreCase) ||
               _userRole.Equals("User", StringComparison.OrdinalIgnoreCase);
    }

    private bool CanWrite()
    {
        // Only Admin and User can write
        return _userRole.Equals("Admin", StringComparison.OrdinalIgnoreCase) ||
               _userRole.Equals("User", StringComparison.OrdinalIgnoreCase);
    }

    private bool CanDelete()
    {
        // Only Admin can delete
        return _userRole.Equals("Admin", StringComparison.OrdinalIgnoreCase);
    }
}
