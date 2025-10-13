namespace Enterprise.BasePatterns.Plugin;

/// <summary>
/// Base plugin interface that all plugins must implement.
/// Links classes during configuration rather than compilation.
/// </summary>
public interface IPlugin
{
    /// <summary>
    /// Gets the name of the plugin
    /// </summary>
    string Name { get; }

    /// <summary>
    /// Gets the version of the plugin
    /// </summary>
    string Version { get; }

    /// <summary>
    /// Initializes the plugin with configuration
    /// </summary>
    void Initialize();

    /// <summary>
    /// Executes the plugin's main functionality
    /// </summary>
    void Execute();

    /// <summary>
    /// Cleans up plugin resources
    /// </summary>
    void Shutdown();
}
