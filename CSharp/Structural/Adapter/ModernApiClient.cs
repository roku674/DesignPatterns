using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Adapter;

/// <summary>
/// Modern REST API client using HttpClient.
/// This represents a new third-party API we want to integrate.
/// </summary>
public class ModernApiClient
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;

    public ModernApiClient(HttpClient httpClient, string baseUrl)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _baseUrl = baseUrl ?? throw new ArgumentNullException(nameof(baseUrl));
    }

    /// <summary>
    /// Gets user using modern REST API pattern.
    /// </summary>
    public async Task<ApiUserResponse?> GetUserByIdAsync(int id)
    {
        try
        {
            HttpResponseMessage response = await _httpClient.GetAsync($"{_baseUrl}/users/{id}");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<ApiUserResponse>();
        }
        catch (HttpRequestException)
        {
            return null;
        }
    }

    /// <summary>
    /// Gets all users using modern REST API pattern.
    /// </summary>
    public async Task<List<ApiUserResponse>> GetAllUsersAsync()
    {
        try
        {
            HttpResponseMessage response = await _httpClient.GetAsync($"{_baseUrl}/users");
            response.EnsureSuccessStatusCode();
            List<ApiUserResponse>? users = await response.Content.ReadFromJsonAsync<List<ApiUserResponse>>();
            return users ?? new List<ApiUserResponse>();
        }
        catch (HttpRequestException)
        {
            return new List<ApiUserResponse>();
        }
    }

    /// <summary>
    /// Creates user using modern REST API pattern.
    /// </summary>
    public async Task<ApiUserResponse?> CreateUserAsync(ApiUserRequest request)
    {
        try
        {
            HttpResponseMessage response = await _httpClient.PostAsJsonAsync($"{_baseUrl}/users", request);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<ApiUserResponse>();
        }
        catch (HttpRequestException)
        {
            return null;
        }
    }

    /// <summary>
    /// Deletes user using modern REST API pattern.
    /// </summary>
    public async Task<bool> DeleteUserAsync(int id)
    {
        try
        {
            HttpResponseMessage response = await _httpClient.DeleteAsync($"{_baseUrl}/users/{id}");
            return response.IsSuccessStatusCode;
        }
        catch (HttpRequestException)
        {
            return false;
        }
    }
}

/// <summary>
/// Modern API response format with nested structure and ISO dates.
/// </summary>
public class ApiUserResponse
{
    public int UserId { get; set; }
    public PersonalInfo? Personal { get; set; }
    public ContactInfo? Contact { get; set; }
    public AccountInfo? Account { get; set; }
}

public class PersonalInfo
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}

public class ContactInfo
{
    public string Email { get; set; } = string.Empty;
}

public class AccountInfo
{
    public bool Active { get; set; }
    public DateTime RegisteredDate { get; set; }
}

/// <summary>
/// Modern API request format.
/// </summary>
public class ApiUserRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
