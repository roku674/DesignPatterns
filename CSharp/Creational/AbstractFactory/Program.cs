namespace AbstractFactory;

/// <summary>
/// Demonstrates the Abstract Factory pattern with a cross-platform GUI example.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Abstract Factory Pattern Demo ===");
        Console.WriteLine("Cross-Platform GUI Application\n");

        // Determine platform (in real app, this would detect actual OS)
        string platform = GetPlatform();

        Console.WriteLine($"Detected platform: {platform}");

        // Create appropriate factory based on platform
        IGUIFactory factory = CreateFactory(platform);

        // Create application with the factory
        Application app = new Application(factory);

        // Use the application
        app.RenderUI();
        app.InteractWithUI();

        Console.WriteLine("\n" + new string('=', 50));

        // Demonstrate with another platform
        Console.WriteLine("\nSwitching to different platform...\n");
        string anotherPlatform = platform.Equals("Windows") ? "Mac" : "Windows";
        Console.WriteLine($"Platform: {anotherPlatform}");

        IGUIFactory anotherFactory = CreateFactory(anotherPlatform);
        Application anotherApp = new Application(anotherFactory);

        anotherApp.RenderUI();
        anotherApp.InteractWithUI();
    }

    /// <summary>
    /// Simulates platform detection.
    /// In a real application, this would check Environment.OSVersion or similar.
    /// </summary>
    private static string GetPlatform()
    {
        // For demo purposes, alternate between platforms
        return DateTime.Now.Second % 2 == 0 ? "Windows" : "Mac";
    }

    /// <summary>
    /// Factory method to create the appropriate GUI factory based on platform.
    /// </summary>
    private static IGUIFactory CreateFactory(string platform)
    {
        return platform switch
        {
            "Windows" => new WindowsFactory(),
            "Mac" => new MacFactory(),
            _ => throw new ArgumentException($"Unknown platform: {platform}")
        };
    }
}
