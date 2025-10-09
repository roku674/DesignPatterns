using System.Threading.Tasks;
using System.Collections.Generic;

namespace Adapter;

/// <summary>
/// Adapter that makes ModernApiClient compatible with our IDataRepository interface.
/// Handles nested data structure flattening and API-specific conversions.
/// </summary>
public class ModernApiAdapter : IDataRepository
{
    private readonly ModernApiClient _apiClient;

    public ModernApiAdapter(ModernApiClient apiClient)
    {
        _apiClient = apiClient ?? throw new ArgumentNullException(nameof(apiClient));
    }

    /// <summary>
    /// Adapts GetUserByIdAsync to our standard interface, flattening nested structure.
    /// </summary>
    public async Task<UserData?> GetUserAsync(int userId)
    {
        ApiUserResponse? apiResponse = await _apiClient.GetUserByIdAsync(userId);
        if (apiResponse == null)
        {
            return null;
        }

        return ConvertToUserData(apiResponse);
    }

    /// <summary>
    /// Adapts GetAllUsersAsync to our standard interface.
    /// </summary>
    public async Task<List<UserData>> GetAllUsersAsync()
    {
        List<ApiUserResponse> apiResponses = await _apiClient.GetAllUsersAsync();

        List<UserData> users = new List<UserData>();
        foreach (ApiUserResponse apiResponse in apiResponses)
        {
            users.Add(ConvertToUserData(apiResponse));
        }

        return users;
    }

    /// <summary>
    /// Adapts CreateUserAsync to our standard interface, building nested structure.
    /// </summary>
    public async Task<UserData> CreateUserAsync(UserData user)
    {
        if (user == null)
        {
            throw new ArgumentNullException(nameof(user));
        }

        ApiUserRequest request = ConvertToApiRequest(user);
        ApiUserResponse? response = await _apiClient.CreateUserAsync(request);

        if (response == null)
        {
            throw new InvalidOperationException("Failed to create user via API");
        }

        return ConvertToUserData(response);
    }

    /// <summary>
    /// Adapts DeleteUserAsync to our standard interface.
    /// </summary>
    public async Task<bool> DeleteUserAsync(int userId)
    {
        return await _apiClient.DeleteUserAsync(userId);
    }

    /// <summary>
    /// Converts nested API response format to flat UserData format.
    /// </summary>
    private UserData ConvertToUserData(ApiUserResponse apiResponse)
    {
        if (apiResponse.Personal == null || apiResponse.Contact == null || apiResponse.Account == null)
        {
            throw new InvalidOperationException("API response missing required nested data");
        }

        return new UserData
        {
            Id = apiResponse.UserId,
            FullName = $"{apiResponse.Personal.FirstName} {apiResponse.Personal.LastName}",
            EmailAddress = apiResponse.Contact.Email,
            IsActive = apiResponse.Account.Active,
            CreatedAt = apiResponse.Account.RegisteredDate
        };
    }

    /// <summary>
    /// Converts flat UserData to API request format.
    /// </summary>
    private ApiUserRequest ConvertToApiRequest(UserData user)
    {
        string[] nameParts = user.FullName.Split(' ', 2);
        string firstName = nameParts.Length > 0 ? nameParts[0] : string.Empty;
        string lastName = nameParts.Length > 1 ? nameParts[1] : string.Empty;

        return new ApiUserRequest
        {
            FirstName = firstName,
            LastName = lastName,
            Email = user.EmailAddress
        };
    }
}
