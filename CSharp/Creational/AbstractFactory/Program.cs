namespace AbstractFactory;

/// <summary>
/// Demonstrates the Abstract Factory pattern with real UI component rendering.
/// Shows production-ready HTML generation and console-based UI rendering.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Abstract Factory Pattern Demo ===");
        Console.WriteLine("Production-Ready UI Component Factory\n");

        DemoMaterialDesign();

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        DemoBootstrap();

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        DemoHtmlGeneration();

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Original demo
        DemoCrossPlatform();
    }

    /// <summary>
    /// Demonstrates Material Design component factory.
    /// </summary>
    private static void DemoMaterialDesign()
    {
        Console.WriteLine("--- Material Design Factory Demo ---\n");

        MaterialFactory factory = new MaterialFactory("light");
        Console.WriteLine($"Theme: {factory.GetTheme()}");

        Dictionary<string, string> colors = factory.GetThemeColors();
        Console.WriteLine("Theme Colors:");
        foreach (KeyValuePair<string, string> color in colors)
        {
            Console.WriteLine($"  {color.Key}: {color.Value}");
        }

        Console.WriteLine("\n--- Creating Components ---\n");

        // Create and render button
        IButton button = factory.CreateButton("Submit Form", ButtonType.Primary);
        Console.WriteLine("Material Button (Console Render):");
        ((IUIComponent)button).RenderToConsole();

        Console.WriteLine("\nMaterial Button (HTML):");
        string buttonHtml = ((IUIComponent)button).RenderToHtml();
        Console.WriteLine(buttonHtml);

        // Create and render checkbox
        ICheckbox checkbox = factory.CreateCheckbox("I agree to terms");
        Console.WriteLine("\nMaterial Checkbox (Console Render):");
        ((IUIComponent)checkbox).RenderToConsole();

        checkbox.Check();
        Console.WriteLine("\nAfter checking:");
        ((IUIComponent)checkbox).RenderToConsole();

        Console.WriteLine("\nMaterial Checkbox (HTML):");
        string checkboxHtml = ((IUIComponent)checkbox).RenderToHtml();
        Console.WriteLine(checkboxHtml);

        // Test interactions
        Console.WriteLine("\n--- Testing Interactions ---");
        button.Click();
        checkbox.Toggle();
        Console.WriteLine($"Checkbox is checked: {checkbox.IsChecked()}");
    }

    /// <summary>
    /// Demonstrates Bootstrap component factory.
    /// </summary>
    private static void DemoBootstrap()
    {
        Console.WriteLine("--- Bootstrap Factory Demo ---\n");

        BootstrapFactory factory = new BootstrapFactory(version: 5, theme: "dark");
        Console.WriteLine($"Theme: {factory.GetTheme()}");

        Console.WriteLine("\n--- Creating Components ---\n");

        // Create danger button
        IButton dangerButton = factory.CreateButton("Delete Account", ButtonType.Danger);
        Console.WriteLine("Bootstrap Danger Button (Console Render):");
        ((IUIComponent)dangerButton).RenderToConsole();

        // Create secondary button
        IButton secondaryButton = factory.CreateButton("Cancel", ButtonType.Secondary);
        Console.WriteLine("\nBootstrap Secondary Button (Console Render):");
        ((IUIComponent)secondaryButton).RenderToConsole();

        // Create checkbox as switch
        BootstrapCheckbox switchCheckbox = new BootstrapCheckbox("Enable notifications", isSwitch: true);
        Console.WriteLine("\nBootstrap Switch (Console Render):");
        switchCheckbox.RenderToConsole();

        switchCheckbox.Check();
        Console.WriteLine("\nAfter enabling:");
        switchCheckbox.RenderToConsole();

        Console.WriteLine("\nBootstrap Components (HTML):");
        Console.WriteLine(((IUIComponent)dangerButton).RenderToHtml());
        Console.WriteLine(switchCheckbox.RenderToHtml());

        // Test interactions
        Console.WriteLine("\n--- Testing Interactions ---");
        dangerButton.Click();
        secondaryButton.Click();
        switchCheckbox.Toggle();
        Console.WriteLine($"Notifications enabled: {switchCheckbox.IsChecked()}");
    }

    /// <summary>
    /// Demonstrates complete HTML page generation.
    /// </summary>
    private static void DemoHtmlGeneration()
    {
        Console.WriteLine("--- HTML Page Generation Demo ---\n");

        // Material Design page
        Console.WriteLine("=== Generating Material Design Page ===\n");
        MaterialFactory materialFactory = new MaterialFactory("light");

        List<IUIComponent> materialComponents = new List<IUIComponent>
        {
            (IUIComponent)materialFactory.CreateButton("Sign Up", ButtonType.Primary),
            (IUIComponent)materialFactory.CreateButton("Learn More", ButtonType.Secondary),
            (IUIComponent)materialFactory.CreateCheckbox("Remember me"),
            (IUIComponent)materialFactory.CreateCheckbox("Subscribe to newsletter")
        };

        string materialPage = materialFactory.RenderPage("Material Design Demo", materialComponents);

        // Save to file
        string materialPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "material_demo.html");
        File.WriteAllText(materialPath, materialPage);
        Console.WriteLine($"Material Design page saved to: {materialPath}");
        Console.WriteLine($"File size: {new FileInfo(materialPath).Length} bytes\n");

        // Bootstrap page
        Console.WriteLine("=== Generating Bootstrap Page ===\n");
        BootstrapFactory bootstrapFactory = new BootstrapFactory(version: 5, theme: "dark");

        List<IUIComponent> bootstrapComponents = new List<IUIComponent>
        {
            (IUIComponent)bootstrapFactory.CreateButton("Submit", ButtonType.Primary),
            (IUIComponent)bootstrapFactory.CreateButton("Cancel", ButtonType.Secondary),
            (IUIComponent)bootstrapFactory.CreateButton("Delete", ButtonType.Danger),
            (IUIComponent)bootstrapFactory.CreateCheckbox("I agree to terms"),
            new BootstrapCheckbox("Enable dark mode", isSwitch: true)
        };

        string bootstrapPage = bootstrapFactory.RenderPage("Bootstrap Demo", bootstrapComponents);

        string bootstrapPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "bootstrap_demo.html");
        File.WriteAllText(bootstrapPath, bootstrapPage);
        Console.WriteLine($"Bootstrap page saved to: {bootstrapPath}");
        Console.WriteLine($"File size: {new FileInfo(bootstrapPath).Length} bytes\n");

        Console.WriteLine("Open these HTML files in a browser to see the rendered UI!");

        // Display preview of generated HTML
        Console.WriteLine("\n--- Bootstrap HTML Preview (first 500 chars) ---");
        Console.WriteLine(bootstrapPage.Substring(0, Math.Min(500, bootstrapPage.Length)) + "...");
    }

    /// <summary>
    /// Demonstrates original cross-platform example.
    /// </summary>
    private static void DemoCrossPlatform()
    {
        Console.WriteLine("--- Cross-Platform GUI Demo (Educational) ---\n");

        string platform = DateTime.Now.Second % 2 == 0 ? "Windows" : "Mac";
        Console.WriteLine($"Detected platform: {platform}");

        IGUIFactory factory = CreateFactory(platform);
        Application app = new Application(factory);

        app.RenderUI();
        app.InteractWithUI();

        Console.WriteLine("\nSwitching to different platform...\n");
        string anotherPlatform = platform.Equals("Windows") ? "Mac" : "Windows";
        Console.WriteLine($"Platform: {anotherPlatform}");

        IGUIFactory anotherFactory = CreateFactory(anotherPlatform);
        Application anotherApp = new Application(anotherFactory);

        anotherApp.RenderUI();
        anotherApp.InteractWithUI();
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
