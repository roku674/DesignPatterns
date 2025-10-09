using System.Threading.Tasks;
using System.Collections.Generic;

namespace Facade;

/// <summary>
/// Complex subsystem component - Data access layer.
/// </summary>
public class DataService
{
    private readonly Dictionary<int, User> _database = new Dictionary<int, User>();
    private int _nextId = 1;

    public DataService()
    {
        // Initialize with sample data
        _database[_nextId] = new User { Id = _nextId, Username = "admin", Email = "admin@example.com", IsActive = true };
        _nextId++;
        _database[_nextId] = new User { Id = _nextId, Username = "user1", Email = "user1@example.com", IsActive = true };
        _nextId++;
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        await Task.Delay(50); // Simulate database latency
        Console.WriteLine($"[DataService] Fetching user {id} from database");
        return _database.ContainsKey(id) ? _database[id] : null;
    }

    public async Task<List<User>> GetAllUsersAsync()
    {
        await Task.Delay(100); // Simulate database latency
        Console.WriteLine("[DataService] Fetching all users from database");
        return new List<User>(_database.Values);
    }

    public async Task<User> CreateUserAsync(User user)
    {
        await Task.Delay(50);
        user.Id = _nextId++;
        _database[user.Id] = user;
        Console.WriteLine($"[DataService] Created user {user.Id} in database");
        return user;
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        await Task.Delay(50);
        bool removed = _database.Remove(id);
        Console.WriteLine($"[DataService] Delete user {id}: {(removed ? "Success" : "Failed")}");
        return removed;
    }
}

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
