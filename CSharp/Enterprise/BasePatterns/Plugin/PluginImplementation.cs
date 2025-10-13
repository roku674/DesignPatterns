using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Enterprise.BasePatterns.Plugin;

/// <summary>
/// Plugin manager that handles plugin discovery, loading, and lifecycle management.
/// Demonstrates runtime linking of classes through configuration rather than compilation.
/// </summary>
public class PluginManager
{
    private readonly Dictionary<string, IPlugin> _plugins;
    private readonly List<string> _pluginSearchPaths;

    public PluginManager()
    {
        _plugins = new Dictionary<string, IPlugin>();
        _pluginSearchPaths = new List<string>();
    }

    /// <summary>
    /// Adds a search path for plugin discovery
    /// </summary>
    public void AddSearchPath(string path)
    {
        if (!_pluginSearchPaths.Contains(path))
        {
            _pluginSearchPaths.Add(path);
        }
    }

    /// <summary>
    /// Registers a plugin instance manually
    /// </summary>
    public void RegisterPlugin(IPlugin plugin)
    {
        if (plugin == null)
        {
            throw new ArgumentNullException(nameof(plugin));
        }

        if (_plugins.ContainsKey(plugin.Name))
        {
            throw new InvalidOperationException($"Plugin '{plugin.Name}' is already registered");
        }

        _plugins[plugin.Name] = plugin;
        Console.WriteLine($"[PluginManager] Registered plugin: {plugin.Name} v{plugin.Version}");
    }

    /// <summary>
    /// Discovers and loads plugins from the current assembly
    /// </summary>
    public void DiscoverPlugins()
    {
        Assembly currentAssembly = Assembly.GetExecutingAssembly();
        DiscoverPluginsFromAssembly(currentAssembly);
    }

    /// <summary>
    /// Discovers plugins from a specific assembly
    /// </summary>
    private void DiscoverPluginsFromAssembly(Assembly assembly)
    {
        Type pluginInterface = typeof(IPlugin);
        IEnumerable<Type> pluginTypes = assembly.GetTypes()
            .Where(t => pluginInterface.IsAssignableFrom(t) && !t.IsInterface && !t.IsAbstract);

        foreach (Type pluginType in pluginTypes)
        {
            try
            {
                object instance = Activator.CreateInstance(pluginType);
                if (instance is IPlugin plugin)
                {
                    if (!_plugins.ContainsKey(plugin.Name))
                    {
                        _plugins[plugin.Name] = plugin;
                        Console.WriteLine($"[PluginManager] Discovered plugin: {plugin.Name} v{plugin.Version}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PluginManager] Failed to instantiate plugin {pluginType.Name}: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Initializes all registered plugins
    /// </summary>
    public void InitializeAllPlugins()
    {
        Console.WriteLine("\n[PluginManager] Initializing all plugins...");
        foreach (KeyValuePair<string, IPlugin> entry in _plugins)
        {
            try
            {
                entry.Value.Initialize();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PluginManager] Failed to initialize plugin {entry.Key}: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Executes a specific plugin by name
    /// </summary>
    public void ExecutePlugin(string pluginName)
    {
        if (!_plugins.ContainsKey(pluginName))
        {
            throw new InvalidOperationException($"Plugin '{pluginName}' not found");
        }

        IPlugin plugin = _plugins[pluginName];
        Console.WriteLine($"\n[PluginManager] Executing plugin: {pluginName}");
        plugin.Execute();
    }

    /// <summary>
    /// Executes all registered plugins
    /// </summary>
    public void ExecuteAllPlugins()
    {
        Console.WriteLine("\n[PluginManager] Executing all plugins...");
        foreach (KeyValuePair<string, IPlugin> entry in _plugins)
        {
            try
            {
                entry.Value.Execute();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PluginManager] Failed to execute plugin {entry.Key}: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Shuts down all plugins
    /// </summary>
    public void ShutdownAllPlugins()
    {
        Console.WriteLine("\n[PluginManager] Shutting down all plugins...");
        foreach (KeyValuePair<string, IPlugin> entry in _plugins)
        {
            try
            {
                entry.Value.Shutdown();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PluginManager] Failed to shutdown plugin {entry.Key}: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Gets all registered plugin names
    /// </summary>
    public IEnumerable<string> GetPluginNames()
    {
        return _plugins.Keys;
    }

    /// <summary>
    /// Gets a plugin by name
    /// </summary>
    public IPlugin GetPlugin(string pluginName)
    {
        if (!_plugins.ContainsKey(pluginName))
        {
            throw new InvalidOperationException($"Plugin '{pluginName}' not found");
        }

        return _plugins[pluginName];
    }
}

/// <summary>
/// Base abstract class for plugins with common functionality
/// </summary>
public abstract class PluginBase : IPlugin
{
    public abstract string Name { get; }
    public abstract string Version { get; }

    public virtual void Initialize()
    {
        Console.WriteLine($"  [{Name}] Initialized");
    }

    public abstract void Execute();

    public virtual void Shutdown()
    {
        Console.WriteLine($"  [{Name}] Shut down");
    }
}

/// <summary>
/// Example plugin: Logging functionality
/// </summary>
public class LoggingPlugin : PluginBase
{
    public override string Name => "LoggingPlugin";
    public override string Version => "1.0.0";

    public override void Execute()
    {
        Console.WriteLine($"  [{Name}] Writing log entries...");
        Console.WriteLine($"  [{Name}] [INFO] Application started");
        Console.WriteLine($"  [{Name}] [DEBUG] Plugin system initialized");
        Console.WriteLine($"  [{Name}] Log file saved to: /var/log/app.log");
    }
}

/// <summary>
/// Example plugin: Data validation
/// </summary>
public class ValidationPlugin : PluginBase
{
    public override string Name => "ValidationPlugin";
    public override string Version => "2.1.0";

    private readonly List<string> _rules;

    public ValidationPlugin()
    {
        _rules = new List<string> { "EmailFormat", "PasswordStrength", "RequiredFields" };
    }

    public override void Initialize()
    {
        base.Initialize();
        Console.WriteLine($"  [{Name}] Loaded {_rules.Count} validation rules");
    }

    public override void Execute()
    {
        Console.WriteLine($"  [{Name}] Running validation rules...");
        foreach (string rule in _rules)
        {
            Console.WriteLine($"  [{Name}]   - Validating: {rule} [PASS]");
        }
    }
}

/// <summary>
/// Example plugin: Authentication
/// </summary>
public class AuthenticationPlugin : PluginBase
{
    public override string Name => "AuthenticationPlugin";
    public override string Version => "1.5.2";

    private bool _isAuthenticated;

    public override void Initialize()
    {
        base.Initialize();
        _isAuthenticated = false;
        Console.WriteLine($"  [{Name}] Authentication system ready");
    }

    public override void Execute()
    {
        Console.WriteLine($"  [{Name}] Authenticating user...");
        Console.WriteLine($"  [{Name}] Checking credentials...");
        _isAuthenticated = true;
        Console.WriteLine($"  [{Name}] User authenticated successfully");
    }

    public override void Shutdown()
    {
        _isAuthenticated = false;
        Console.WriteLine($"  [{Name}] User session terminated");
        base.Shutdown();
    }
}

/// <summary>
/// Example plugin: Reporting
/// </summary>
public class ReportingPlugin : PluginBase
{
    public override string Name => "ReportingPlugin";
    public override string Version => "3.0.1";

    public override void Execute()
    {
        Console.WriteLine($"  [{Name}] Generating reports...");
        Console.WriteLine($"  [{Name}] - Monthly Sales Report: Generated");
        Console.WriteLine($"  [{Name}] - User Activity Report: Generated");
        Console.WriteLine($"  [{Name}] - System Health Report: Generated");
        Console.WriteLine($"  [{Name}] All reports saved to: /reports/");
    }
}
