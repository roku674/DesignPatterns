using System.Threading.Tasks;
using System.Collections.Generic;

namespace Facade;

/// <summary>
/// Facade that provides a simplified interface to the complex subsystems.
/// Combines Data, Cache, Validation, and Logging services into easy-to-use methods.
/// This is the REAL Facade pattern - hiding complexity behind a simple API.
/// </summary>
public class UserManagementFacade
{
    private readonly DataService _dataService;
    private readonly CacheService _cacheService;
    private readonly ValidationService _validationService;
    private readonly LoggingService _loggingService;

    public UserManagementFacade(
        DataService dataService,
        CacheService cacheService,
        ValidationService validationService,
        LoggingService loggingService)
    {
        _dataService = dataService ?? throw new ArgumentNullException(nameof(dataService));
        _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
        _validationService = validationService ?? throw new ArgumentNullException(nameof(validationService));
        _loggingService = loggingService ?? throw new ArgumentNullException(nameof(loggingService));
    }

    /// <summary>
    /// Simplified method that handles caching, logging, and error handling automatically.
    /// </summary>
    public async Task<User?> GetUserAsync(int userId)
    {
        await _loggingService.LogInfoAsync($"GetUser request for ID: {userId}");

        // Check cache first
        string cacheKey = $"user_{userId}";
        User? cachedUser = await _cacheService.GetAsync<User>(cacheKey);

        if (cachedUser != null)
        {
            return cachedUser;
        }

        // Cache miss - fetch from database
        User? user = await _dataService.GetUserByIdAsync(userId);

        if (user != null)
        {
            // Cache the result
            await _cacheService.SetAsync(cacheKey, user);
        }
        else
        {
            await _loggingService.LogWarningAsync($"User {userId} not found");
        }

        return user;
    }

    /// <summary>
    /// Simplified method with automatic caching for all users.
    /// </summary>
    public async Task<List<User>> GetAllUsersAsync()
    {
        await _loggingService.LogInfoAsync("GetAllUsers request");

        // Check cache first
        string cacheKey = "all_users";
        List<User>? cachedUsers = await _cacheService.GetAsync<List<User>>(cacheKey);

        if (cachedUsers != null)
        {
            return cachedUsers;
        }

        // Cache miss - fetch from database
        List<User> users = await _dataService.GetAllUsersAsync();

        // Cache the result
        await _cacheService.SetAsync(cacheKey, users);

        return users;
    }

    /// <summary>
    /// Simplified method with automatic validation, logging, and cache invalidation.
    /// </summary>
    public async Task<(bool Success, User? User, ValidationResult ValidationResult)> CreateUserAsync(User user)
    {
        await _loggingService.LogInfoAsync($"CreateUser request for: {user.Username}");

        // Validate first
        ValidationResult validationResult = await _validationService.ValidateUserAsync(user);

        if (!validationResult.IsValid)
        {
            await _loggingService.LogErrorAsync($"User validation failed: {string.Join(", ", validationResult.Errors)}");
            return (false, null, validationResult);
        }

        // Create user
        User createdUser = await _dataService.CreateUserAsync(user);

        // Invalidate relevant caches
        await _cacheService.InvalidateAsync("all_users");

        await _loggingService.LogInfoAsync($"User created successfully: ID {createdUser.Id}");

        return (true, createdUser, validationResult);
    }

    /// <summary>
    /// Simplified method with automatic logging and cache invalidation.
    /// </summary>
    public async Task<bool> DeleteUserAsync(int userId)
    {
        await _loggingService.LogInfoAsync($"DeleteUser request for ID: {userId}");

        bool deleted = await _dataService.DeleteUserAsync(userId);

        if (deleted)
        {
            // Invalidate caches
            await _cacheService.InvalidateAsync($"user_{userId}");
            await _cacheService.InvalidateAsync("all_users");

            await _loggingService.LogInfoAsync($"User {userId} deleted successfully");
        }
        else
        {
            await _loggingService.LogWarningAsync($"Failed to delete user {userId}");
        }

        return deleted;
    }

    /// <summary>
    /// Additional facade method - get system statistics.
    /// </summary>
    public async Task<SystemStats> GetSystemStatsAsync()
    {
        await _loggingService.LogInfoAsync("GetSystemStats request");

        List<User> allUsers = await _dataService.GetAllUsersAsync();
        int activeUsers = 0;
        foreach (User user in allUsers)
        {
            if (user.IsActive)
            {
                activeUsers++;
            }
        }

        SystemStats stats = new SystemStats
        {
            TotalUsers = allUsers.Count,
            ActiveUsers = activeUsers,
            CacheSize = _cacheService.GetCacheSize(),
            LogCount = _loggingService.GetLogs().Count
        };

        return stats;
    }

    /// <summary>
    /// Additional facade method - clear all caches and logs.
    /// </summary>
    public async Task ClearSystemAsync()
    {
        await _loggingService.LogInfoAsync("ClearSystem request");
        await _cacheService.ClearAsync();
        _loggingService.ClearLogs();
        await _loggingService.LogInfoAsync("System cleared");
    }
}

public class SystemStats
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int CacheSize { get; set; }
    public int LogCount { get; set; }
}
