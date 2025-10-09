using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Adapter;

/// <summary>
/// Legacy third-party API with incompatible data format and method signatures.
/// This represents an external service we need to integrate with.
/// </summary>
public class LegacyUserService
{
    private readonly Dictionary<int, LegacyUser> _users = new Dictionary<int, LegacyUser>();
    private int _nextId = 1;

    public LegacyUserService()
    {
        // Initialize with some test data
        _users[_nextId] = new LegacyUser
        {
            user_id = _nextId,
            first_name = "John",
            last_name = "Doe",
            email = "john.doe@example.com",
            active_status = 1,
            registration_timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
        };
        _nextId++;

        _users[_nextId] = new LegacyUser
        {
            user_id = _nextId,
            first_name = "Jane",
            last_name = "Smith",
            email = "jane.smith@example.com",
            active_status = 1,
            registration_timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
        };
        _nextId++;
    }

    /// <summary>
    /// Gets user data in legacy JSON format.
    /// </summary>
    public Task<string> FetchUserJson(int userId)
    {
        if (!_users.ContainsKey(userId))
        {
            return Task.FromResult("{}");
        }

        string json = JsonSerializer.Serialize(_users[userId]);
        return Task.FromResult(json);
    }

    /// <summary>
    /// Gets all users as legacy JSON array.
    /// </summary>
    public Task<string> FetchAllUsersJson()
    {
        List<LegacyUser> allUsers = new List<LegacyUser>(_users.Values);
        string json = JsonSerializer.Serialize(allUsers);
        return Task.FromResult(json);
    }

    /// <summary>
    /// Creates user from legacy JSON format and returns the new user's JSON.
    /// </summary>
    public Task<string> AddUserFromJson(string userJson)
    {
        LegacyUser? legacyUser = JsonSerializer.Deserialize<LegacyUser>(userJson);
        if (legacyUser == null)
        {
            throw new ArgumentException("Invalid user JSON format");
        }

        legacyUser.user_id = _nextId++;
        legacyUser.registration_timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        _users[legacyUser.user_id] = legacyUser;

        string json = JsonSerializer.Serialize(legacyUser);
        return Task.FromResult(json);
    }

    /// <summary>
    /// Removes user and returns 1 for success, 0 for failure.
    /// </summary>
    public Task<int> RemoveUser(int userId)
    {
        bool removed = _users.Remove(userId);
        return Task.FromResult(removed ? 1 : 0);
    }
}

/// <summary>
/// Legacy data format with snake_case naming and different field types.
/// This is the "Adaptee" - the incompatible interface we need to adapt.
/// </summary>
public class LegacyUser
{
    public int user_id { get; set; }
    public string first_name { get; set; } = string.Empty;
    public string last_name { get; set; } = string.Empty;
    public string email { get; set; } = string.Empty;
    public int active_status { get; set; } // 1 = active, 0 = inactive
    public long registration_timestamp { get; set; } // Unix timestamp
}
