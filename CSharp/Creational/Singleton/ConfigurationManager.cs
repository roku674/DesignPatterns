namespace Singleton;

/// <summary>
/// Real-world example: Configuration Manager as a Singleton.
/// Provides centralized access to application configuration settings.
/// </summary>
public sealed class ConfigurationManager
{
    private static readonly Lazy<ConfigurationManager> _instance =
        new Lazy<ConfigurationManager>(() => new ConfigurationManager());

    public static ConfigurationManager Instance => _instance.Value;

    private readonly Dictionary<string, string> _settings;

    /// <summary>
    /// Private constructor loads configuration settings.
    /// </summary>
    private ConfigurationManager()
    {
        _settings = new Dictionary<string, string>();
        LoadDefaultSettings();
        Console.WriteLine("ConfigurationManager: Configuration loaded successfully");
    }

    /// <summary>
    /// Loads default configuration settings.
    /// In a real application, this would read from a config file or environment variables.
    /// </summary>
    private void LoadDefaultSettings()
    {
        _settings["AppName"] = "DesignPatternsDemo";
        _settings["Version"] = "1.0.0";
        _settings["Environment"] = "Development";
        _settings["MaxConnections"] = "100";
        _settings["Timeout"] = "30";
        _settings["EnableLogging"] = "true";
    }

    /// <summary>
    /// Gets a configuration value by key.
    /// </summary>
    public string GetSetting(string key)
    {
        if (_settings.ContainsKey(key))
        {
            return _settings[key];
        }

        throw new KeyNotFoundException($"Configuration key not found: {key}");
    }

    /// <summary>
    /// Sets or updates a configuration value.
    /// </summary>
    public void SetSetting(string key, string value)
    {
        _settings[key] = value;
        Console.WriteLine($"ConfigurationManager: Setting updated - {key} = {value}");
    }

    /// <summary>
    /// Displays all configuration settings.
    /// </summary>
    public void DisplayAllSettings()
    {
        Console.WriteLine("\n=== Configuration Settings ===");
        foreach (KeyValuePair<string, string> setting in _settings)
        {
            Console.WriteLine($"{setting.Key}: {setting.Value}");
        }
        Console.WriteLine("==============================\n");
    }

    /// <summary>
    /// Checks if a setting exists.
    /// </summary>
    public bool HasSetting(string key)
    {
        return _settings.ContainsKey(key);
    }
}
