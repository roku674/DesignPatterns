using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Adapter;

/// <summary>
/// Adapter that makes the LegacyUserService compatible with our IDataRepository interface.
/// Handles data format conversion and method signature adaptation.
/// This is the real Adapter pattern in action - converting between incompatible interfaces.
/// </summary>
public class LegacyUserAdapter : IDataRepository
{
    private readonly LegacyUserService _legacyService;

    public LegacyUserAdapter(LegacyUserService legacyService)
    {
        _legacyService = legacyService ?? throw new ArgumentNullException(nameof(legacyService));
    }

    /// <summary>
    /// Adapts FetchUserJson to GetUserAsync, including data format conversion.
    /// </summary>
    public async Task<UserData?> GetUserAsync(int userId)
    {
        string json = await _legacyService.FetchUserJson(userId);

        if (string.IsNullOrEmpty(json) || json == "{}")
        {
            return null;
        }

        LegacyUser? legacyUser = JsonSerializer.Deserialize<LegacyUser>(json);
        if (legacyUser == null)
        {
            return null;
        }

        return ConvertToUserData(legacyUser);
    }

    /// <summary>
    /// Adapts FetchAllUsersJson to GetAllUsersAsync, including batch conversion.
    /// </summary>
    public async Task<List<UserData>> GetAllUsersAsync()
    {
        string json = await _legacyService.FetchAllUsersJson();

        List<LegacyUser>? legacyUsers = JsonSerializer.Deserialize<List<LegacyUser>>(json);
        if (legacyUsers == null || legacyUsers.Count == 0)
        {
            return new List<UserData>();
        }

        List<UserData> users = new List<UserData>();
        foreach (LegacyUser legacyUser in legacyUsers)
        {
            users.Add(ConvertToUserData(legacyUser));
        }

        return users;
    }

    /// <summary>
    /// Adapts AddUserFromJson to CreateUserAsync, including data format conversion.
    /// </summary>
    public async Task<UserData> CreateUserAsync(UserData user)
    {
        if (user == null)
        {
            throw new ArgumentNullException(nameof(user));
        }

        LegacyUser legacyUser = ConvertToLegacyUser(user);
        string legacyJson = JsonSerializer.Serialize(legacyUser);

        string resultJson = await _legacyService.AddUserFromJson(legacyJson);

        LegacyUser? createdUser = JsonSerializer.Deserialize<LegacyUser>(resultJson);
        if (createdUser == null)
        {
            throw new InvalidOperationException("Failed to create user");
        }

        return ConvertToUserData(createdUser);
    }

    /// <summary>
    /// Adapts RemoveUser to DeleteUserAsync, converting int result to bool.
    /// </summary>
    public async Task<bool> DeleteUserAsync(int userId)
    {
        int result = await _legacyService.RemoveUser(userId);
        return result == 1;
    }

    /// <summary>
    /// Converts legacy snake_case format to modern PascalCase format.
    /// Handles data type conversions (Unix timestamp to DateTime, int to bool).
    /// </summary>
    private UserData ConvertToUserData(LegacyUser legacyUser)
    {
        return new UserData
        {
            Id = legacyUser.user_id,
            FullName = $"{legacyUser.first_name} {legacyUser.last_name}",
            EmailAddress = legacyUser.email,
            IsActive = legacyUser.active_status == 1,
            CreatedAt = DateTimeOffset.FromUnixTimeSeconds(legacyUser.registration_timestamp).DateTime
        };
    }

    /// <summary>
    /// Converts modern format back to legacy format.
    /// Handles reverse data type conversions.
    /// </summary>
    private LegacyUser ConvertToLegacyUser(UserData user)
    {
        string[] nameParts = user.FullName.Split(' ', 2);
        string firstName = nameParts.Length > 0 ? nameParts[0] : string.Empty;
        string lastName = nameParts.Length > 1 ? nameParts[1] : string.Empty;

        return new LegacyUser
        {
            user_id = user.Id,
            first_name = firstName,
            last_name = lastName,
            email = user.EmailAddress,
            active_status = user.IsActive ? 1 : 0,
            registration_timestamp = new DateTimeOffset(user.CreatedAt).ToUnixTimeSeconds()
        };
    }
}
