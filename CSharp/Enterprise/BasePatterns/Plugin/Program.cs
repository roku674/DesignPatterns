using System;
using System.Linq;

namespace Enterprise.BasePatterns.Plugin;

/// <summary>
/// Demonstrates the Plugin pattern with dynamic loading and extensible architecture.
/// Shows how to link classes at configuration time rather than compilation time.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Plugin Pattern Demo ===");
        Console.WriteLine("Demonstrates runtime linking of classes through configuration\n");

        // Create the plugin manager
        PluginManager manager = new PluginManager();

        // Demonstration 1: Manual Plugin Registration
        Console.WriteLine("--- Scenario 1: Manual Plugin Registration ---");
        IPlugin loggingPlugin = new LoggingPlugin();
        manager.RegisterPlugin(loggingPlugin);

        // Demonstration 2: Automatic Plugin Discovery
        Console.WriteLine("\n--- Scenario 2: Automatic Plugin Discovery ---");
        Console.WriteLine("Scanning assembly for plugins implementing IPlugin...");
        manager.DiscoverPlugins();

        // Demonstration 3: Initialize All Plugins
        manager.InitializeAllPlugins();

        // Demonstration 4: List All Registered Plugins
        Console.WriteLine("\n--- Scenario 3: List Registered Plugins ---");
        Console.WriteLine($"Total plugins registered: {manager.GetPluginNames().Count()}");
        foreach (string pluginName in manager.GetPluginNames())
        {
            IPlugin plugin = manager.GetPlugin(pluginName);
            Console.WriteLine($"  - {plugin.Name} (v{plugin.Version})");
        }

        // Demonstration 5: Execute Specific Plugin
        Console.WriteLine("\n--- Scenario 4: Execute Specific Plugin ---");
        manager.ExecutePlugin("ValidationPlugin");

        // Demonstration 6: Execute All Plugins
        Console.WriteLine("\n--- Scenario 5: Execute All Plugins ---");
        manager.ExecuteAllPlugins();

        // Demonstration 7: Shutdown All Plugins
        manager.ShutdownAllPlugins();

        // Demonstration 8: Extensibility Example
        Console.WriteLine("\n--- Scenario 6: Extensibility Example ---");
        Console.WriteLine("Adding new custom plugin at runtime...");
        IPlugin customPlugin = new CustomBusinessPlugin();
        manager.RegisterPlugin(customPlugin);
        customPlugin.Initialize();
        customPlugin.Execute();
        customPlugin.Shutdown();

        Console.WriteLine("\n=== Key Benefits of Plugin Pattern ===");
        Console.WriteLine("1. Runtime Extensibility: Add functionality without recompilation");
        Console.WriteLine("2. Loose Coupling: Plugins are independent of the host application");
        Console.WriteLine("3. Hot-Swapping: Replace plugins at runtime without restart");
        Console.WriteLine("4. Third-Party Integration: Easy to accept external plugins");
        Console.WriteLine("5. Configuration-Based: Link classes through config, not compilation");

        Console.WriteLine("\n=== Demo Complete ===");
    }
}

/// <summary>
/// Example of a custom business-specific plugin that can be added at runtime
/// </summary>
public class CustomBusinessPlugin : PluginBase
{
    public override string Name => "CustomBusinessPlugin";
    public override string Version => "1.0.0";

    public override void Initialize()
    {
        base.Initialize();
        Console.WriteLine($"  [{Name}] Loading business rules from configuration...");
    }

    public override void Execute()
    {
        Console.WriteLine($"  [{Name}] Processing business logic...");
        Console.WriteLine($"  [{Name}] Calculating revenue: $1,234,567");
        Console.WriteLine($"  [{Name}] Updating inventory: 150 items processed");
        Console.WriteLine($"  [{Name}] Sending notifications: 25 customers notified");
    }

    public override void Shutdown()
    {
        Console.WriteLine($"  [{Name}] Saving state to database...");
        base.Shutdown();
    }
}
