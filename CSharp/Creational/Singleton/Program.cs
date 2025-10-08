namespace Singleton;

/// <summary>
/// Demonstrates the Singleton pattern with multiple real-world examples.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Singleton Pattern Demo ===\n");

        // Example 1: Basic Singleton
        DemoBasicSingleton();

        Console.WriteLine("\n" + new string('=', 60) + "\n");

        // Example 2: Database Connection Singleton
        DemoDatabaseConnection();

        Console.WriteLine("\n" + new string('=', 60) + "\n");

        // Example 3: Logger Singleton
        DemoLogger();

        Console.WriteLine("\n" + new string('=', 60) + "\n");

        // Example 4: Configuration Manager Singleton
        DemoConfigurationManager();

        Console.WriteLine("\n" + new string('=', 60) + "\n");

        // Example 5: Thread-Safe Singleton
        DemoThreadSafeSingleton();

        Console.WriteLine("\n" + new string('=', 60) + "\n");

        // Example 6: Verify Singleton Behavior
        VerifySingletonBehavior();
    }

    /// <summary>
    /// Demonstrates basic singleton usage.
    /// </summary>
    private static void DemoBasicSingleton()
    {
        Console.WriteLine("--- Basic Singleton Demo ---\n");

        BasicSingleton singleton1 = BasicSingleton.Instance;
        singleton1.DoSomething();

        BasicSingleton singleton2 = BasicSingleton.Instance;
        singleton2.DoSomething();

        Console.WriteLine($"\nAre both instances the same? {ReferenceEquals(singleton1, singleton2)}");
        Console.WriteLine($"singleton1 HashCode: {singleton1.GetHashCode()}");
        Console.WriteLine($"singleton2 HashCode: {singleton2.GetHashCode()}");
    }

    /// <summary>
    /// Demonstrates database connection singleton.
    /// </summary>
    private static void DemoDatabaseConnection()
    {
        Console.WriteLine("--- Database Connection Singleton Demo ---\n");

        DatabaseConnection db = DatabaseConnection.Instance;
        db.ExecuteQuery("SELECT * FROM Users");
        db.ExecuteQuery("INSERT INTO Logs VALUES ('Login', '2024-01-01')");
        db.ExecuteQuery("UPDATE Settings SET Theme='Dark'");

        Console.WriteLine();
        db.GetStatistics();

        // Another part of the application uses the same database connection
        Console.WriteLine("\n--- Different part of application ---");
        DatabaseConnection sameDb = DatabaseConnection.Instance;
        sameDb.ExecuteQuery("SELECT * FROM Products");

        Console.WriteLine();
        sameDb.GetStatistics();
    }

    /// <summary>
    /// Demonstrates logger singleton.
    /// </summary>
    private static void DemoLogger()
    {
        Console.WriteLine("--- Logger Singleton Demo ---\n");

        Logger logger = Logger.Instance;
        logger.LogInfo("Application started");
        logger.LogInfo("User logged in: john.doe");
        logger.LogWarning("High memory usage detected");
        logger.LogError("Failed to connect to external API");
        logger.LogInfo("Application shutting down");

        Console.WriteLine($"\nTotal log entries: {logger.GetLogCount()}");

        // Another component uses the same logger
        Console.WriteLine("\n--- Different component logging ---");
        Logger sameLogger = Logger.Instance;
        sameLogger.LogInfo("Background task completed");

        sameLogger.DisplayAllLogs();
    }

    /// <summary>
    /// Demonstrates configuration manager singleton.
    /// </summary>
    private static void DemoConfigurationManager()
    {
        Console.WriteLine("--- Configuration Manager Singleton Demo ---\n");

        ConfigurationManager config = ConfigurationManager.Instance;
        config.DisplayAllSettings();

        Console.WriteLine("--- Reading configuration values ---");
        Console.WriteLine($"App Name: {config.GetSetting("AppName")}");
        Console.WriteLine($"Version: {config.GetSetting("Version")}");
        Console.WriteLine($"Environment: {config.GetSetting("Environment")}");

        Console.WriteLine("\n--- Updating configuration ---");
        config.SetSetting("Environment", "Production");
        config.SetSetting("MaxConnections", "200");

        // Another component reads the updated configuration
        Console.WriteLine("\n--- Different component reading config ---");
        ConfigurationManager sameConfig = ConfigurationManager.Instance;
        Console.WriteLine($"Environment: {sameConfig.GetSetting("Environment")}");
        Console.WriteLine($"MaxConnections: {sameConfig.GetSetting("MaxConnections")}");

        sameConfig.DisplayAllSettings();
    }

    /// <summary>
    /// Demonstrates thread-safe singleton implementation.
    /// </summary>
    private static void DemoThreadSafeSingleton()
    {
        Console.WriteLine("--- Thread-Safe Singleton Demo ---\n");

        ThreadSafeSingleton singleton1 = ThreadSafeSingleton.Instance;
        singleton1.DoSomething();

        ThreadSafeSingleton singleton2 = ThreadSafeSingleton.Instance;
        singleton2.DoSomething();

        Console.WriteLine($"\nAre both instances the same? {ReferenceEquals(singleton1, singleton2)}");
    }

    /// <summary>
    /// Verifies that singletons maintain the same instance across the application.
    /// </summary>
    private static void VerifySingletonBehavior()
    {
        Console.WriteLine("--- Verifying Singleton Behavior ---\n");

        // Get instances multiple times
        Logger logger1 = Logger.Instance;
        Logger logger2 = Logger.Instance;
        Logger logger3 = Logger.Instance;

        DatabaseConnection db1 = DatabaseConnection.Instance;
        DatabaseConnection db2 = DatabaseConnection.Instance;

        ConfigurationManager config1 = ConfigurationManager.Instance;
        ConfigurationManager config2 = ConfigurationManager.Instance;

        Console.WriteLine("Instance Comparisons:");
        Console.WriteLine($"Logger instances are same: {ReferenceEquals(logger1, logger2) && ReferenceEquals(logger2, logger3)}");
        Console.WriteLine($"DatabaseConnection instances are same: {ReferenceEquals(db1, db2)}");
        Console.WriteLine($"ConfigurationManager instances are same: {ReferenceEquals(config1, config2)}");

        Console.WriteLine("\nHash Codes:");
        Console.WriteLine($"Logger: {logger1.GetHashCode()} = {logger2.GetHashCode()} = {logger3.GetHashCode()}");
        Console.WriteLine($"DatabaseConnection: {db1.GetHashCode()} = {db2.GetHashCode()}");
        Console.WriteLine($"ConfigurationManager: {config1.GetHashCode()} = {config2.GetHashCode()}");
    }
}
