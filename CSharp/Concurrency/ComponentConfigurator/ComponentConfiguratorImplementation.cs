using System;
using System.Collections.Generic;
using System.Linq;

namespace Concurrency.ComponentConfigurator;

/// <summary>
/// Concrete implementation of ComponentConfigurator pattern.
/// Allows application to link/unlink component implementations at runtime
/// </summary>
public class ComponentConfiguratorImplementation : IComponentConfigurator
{
    public void Execute()
    {
        Console.WriteLine("=== ComponentConfigurator Pattern Demo ===\n");

        // Demonstrate dynamic component configuration
        ComponentConfigurator configurator = new ComponentConfigurator();

        // Configuration-based component assembly
        Console.WriteLine("1. Loading components from configuration...");
        ComponentConfiguration config = new ComponentConfiguration
        {
            Components = new List<ComponentDescriptor>
            {
                new ComponentDescriptor { Name = "Logger", Type = "FileLogger", Priority = 1 },
                new ComponentDescriptor { Name = "Cache", Type = "MemoryCache", Priority = 2 },
                new ComponentDescriptor { Name = "Database", Type = "SqlDatabase", Priority = 3 }
            }
        };

        configurator.LoadFromConfiguration(config);
        Console.WriteLine("Components loaded successfully.\n");

        // Demonstrate dynamic linking
        Console.WriteLine("2. Linking components at runtime...");
        IComponent logger = new FileLogger();
        configurator.LinkComponent("Logger", logger);

        IComponent cache = new MemoryCache();
        configurator.LinkComponent("Cache", cache);

        IComponent database = new SqlDatabase();
        configurator.LinkComponent("Database", database);
        Console.WriteLine("All components linked.\n");

        // Initialize components with dependency injection
        Console.WriteLine("3. Initializing components with dependency injection...");
        configurator.InitializeAll();
        Console.WriteLine();

        // Execute components
        Console.WriteLine("4. Executing component operations...");
        configurator.ExecuteAll();
        Console.WriteLine();

        // Demonstrate dynamic unlinking
        Console.WriteLine("5. Unlinking cache component...");
        configurator.UnlinkComponent("Cache");
        Console.WriteLine("Cache component unlinked.\n");

        // Re-execute without cache
        Console.WriteLine("6. Re-executing without cache...");
        configurator.ExecuteAll();
        Console.WriteLine();

        // Demonstrate hot-swapping
        Console.WriteLine("7. Hot-swapping logger implementation...");
        IComponent consoleLogger = new ConsoleLogger();
        configurator.UnlinkComponent("Logger");
        configurator.LinkComponent("Logger", consoleLogger);
        configurator.InitializeComponent("Logger");
        configurator.ExecuteAll();
        Console.WriteLine();

        // Cleanup
        Console.WriteLine("8. Shutting down all components...");
        configurator.ShutdownAll();

        Console.WriteLine("\n=== Pattern demonstration complete ===");
    }
}

/// <summary>
/// Base interface for all configurable components
/// </summary>
public interface IComponent
{
    string Name { get; }
    void Initialize(IDictionary<string, IComponent> dependencies);
    void Execute();
    void Shutdown();
}

/// <summary>
/// Component descriptor for configuration
/// </summary>
public class ComponentDescriptor
{
    public string Name { get; set; }
    public string Type { get; set; }
    public int Priority { get; set; }
    public List<string> Dependencies { get; set; } = new List<string>();
}

/// <summary>
/// Component configuration container
/// </summary>
public class ComponentConfiguration
{
    public List<ComponentDescriptor> Components { get; set; } = new List<ComponentDescriptor>();
}

/// <summary>
/// Main configurator that manages component lifecycle
/// </summary>
public class ComponentConfigurator
{
    private readonly Dictionary<string, IComponent> _components;
    private readonly Dictionary<string, ComponentDescriptor> _descriptors;
    private readonly object _lock = new object();

    public ComponentConfigurator()
    {
        _components = new Dictionary<string, IComponent>();
        _descriptors = new Dictionary<string, ComponentDescriptor>();
    }

    /// <summary>
    /// Load component configuration
    /// </summary>
    public void LoadFromConfiguration(ComponentConfiguration config)
    {
        lock (_lock)
        {
            foreach (ComponentDescriptor descriptor in config.Components)
            {
                _descriptors[descriptor.Name] = descriptor;
            }
        }
    }

    /// <summary>
    /// Dynamically link a component at runtime
    /// </summary>
    public void LinkComponent(string name, IComponent component)
    {
        lock (_lock)
        {
            if (_components.ContainsKey(name))
            {
                Console.WriteLine($"  Warning: Component '{name}' already exists. Replacing...");
            }

            _components[name] = component;
            Console.WriteLine($"  Linked component: {name} ({component.GetType().Name})");
        }
    }

    /// <summary>
    /// Dynamically unlink a component at runtime
    /// </summary>
    public void UnlinkComponent(string name)
    {
        lock (_lock)
        {
            if (_components.ContainsKey(name))
            {
                IComponent component = _components[name];
                component.Shutdown();
                _components.Remove(name);
                Console.WriteLine($"  Unlinked component: {name}");
            }
            else
            {
                Console.WriteLine($"  Warning: Component '{name}' not found.");
            }
        }
    }

    /// <summary>
    /// Initialize a specific component with dependency injection
    /// </summary>
    public void InitializeComponent(string name)
    {
        lock (_lock)
        {
            if (_components.ContainsKey(name))
            {
                IComponent component = _components[name];

                // Inject dependencies
                Dictionary<string, IComponent> dependencies = new Dictionary<string, IComponent>();
                if (_descriptors.ContainsKey(name))
                {
                    ComponentDescriptor descriptor = _descriptors[name];
                    foreach (string depName in descriptor.Dependencies)
                    {
                        if (_components.ContainsKey(depName))
                        {
                            dependencies[depName] = _components[depName];
                        }
                    }
                }

                component.Initialize(dependencies);
            }
        }
    }

    /// <summary>
    /// Initialize all components in priority order
    /// </summary>
    public void InitializeAll()
    {
        lock (_lock)
        {
            // Sort by priority if descriptors exist
            List<string> componentNames = _components.Keys.ToList();
            if (_descriptors.Count > 0)
            {
                componentNames = componentNames
                    .OrderBy(name => _descriptors.ContainsKey(name) ? _descriptors[name].Priority : int.MaxValue)
                    .ToList();
            }

            foreach (string name in componentNames)
            {
                InitializeComponent(name);
            }
        }
    }

    /// <summary>
    /// Execute all active components
    /// </summary>
    public void ExecuteAll()
    {
        lock (_lock)
        {
            foreach (KeyValuePair<string, IComponent> pair in _components)
            {
                pair.Value.Execute();
            }
        }
    }

    /// <summary>
    /// Shutdown all components
    /// </summary>
    public void ShutdownAll()
    {
        lock (_lock)
        {
            // Shutdown in reverse priority order
            List<string> componentNames = _components.Keys.ToList();
            if (_descriptors.Count > 0)
            {
                componentNames = componentNames
                    .OrderByDescending(name => _descriptors.ContainsKey(name) ? _descriptors[name].Priority : int.MaxValue)
                    .ToList();
            }

            foreach (string name in componentNames)
            {
                _components[name].Shutdown();
            }

            _components.Clear();
        }
    }
}

/// <summary>
/// Example component: File-based logger
/// </summary>
public class FileLogger : IComponent
{
    public string Name => "FileLogger";

    public void Initialize(IDictionary<string, IComponent> dependencies)
    {
        Console.WriteLine($"  {Name}: Initialized (File: application.log)");
    }

    public void Execute()
    {
        Console.WriteLine($"  {Name}: Writing log entry to file...");
    }

    public void Shutdown()
    {
        Console.WriteLine($"  {Name}: Closing log file...");
    }
}

/// <summary>
/// Example component: Console-based logger
/// </summary>
public class ConsoleLogger : IComponent
{
    public string Name => "ConsoleLogger";

    public void Initialize(IDictionary<string, IComponent> dependencies)
    {
        Console.WriteLine($"  {Name}: Initialized (Output: Console)");
    }

    public void Execute()
    {
        Console.WriteLine($"  {Name}: Writing log entry to console...");
    }

    public void Shutdown()
    {
        Console.WriteLine($"  {Name}: Flushing console buffer...");
    }
}

/// <summary>
/// Example component: In-memory cache
/// </summary>
public class MemoryCache : IComponent
{
    public string Name => "MemoryCache";

    public void Initialize(IDictionary<string, IComponent> dependencies)
    {
        Console.WriteLine($"  {Name}: Initialized (Size: 1024MB)");
    }

    public void Execute()
    {
        Console.WriteLine($"  {Name}: Cache hit ratio: 87%");
    }

    public void Shutdown()
    {
        Console.WriteLine($"  {Name}: Clearing cache and releasing memory...");
    }
}

/// <summary>
/// Example component: SQL database connection
/// </summary>
public class SqlDatabase : IComponent
{
    public string Name => "SqlDatabase";

    public void Initialize(IDictionary<string, IComponent> dependencies)
    {
        Console.WriteLine($"  {Name}: Initialized (Connection pool: 10 connections)");
    }

    public void Execute()
    {
        Console.WriteLine($"  {Name}: Executing query... [Active connections: 3/10]");
    }

    public void Shutdown()
    {
        Console.WriteLine($"  {Name}: Closing all database connections...");
    }
}
