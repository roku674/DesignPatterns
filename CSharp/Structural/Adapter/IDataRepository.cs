using System.Threading.Tasks;
using System.Collections.Generic;

namespace Adapter;

/// <summary>
/// Target interface that our application expects.
/// Represents a standard repository interface for accessing user data.
/// </summary>
public interface IDataRepository
{
    Task<UserData?> GetUserAsync(int userId);
    Task<List<UserData>> GetAllUsersAsync();
    Task<UserData> CreateUserAsync(UserData user);
    Task<bool> DeleteUserAsync(int userId);
}

/// <summary>
/// Standard data model used throughout our application.
/// </summary>
public class UserData
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string EmailAddress { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
