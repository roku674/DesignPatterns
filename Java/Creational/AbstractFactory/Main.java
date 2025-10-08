/**
 * Main class to demonstrate the Abstract Factory pattern
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("=== Abstract Factory Pattern Demo ===");

        // Simulate OS detection
        String osName = System.getProperty("os.name").toLowerCase();
        GUIFactory factory;

        // Select appropriate factory based on OS
        if (osName.contains("win")) {
            System.out.println("\nDetected Windows OS - Using Windows Factory");
            factory = new WindowsFactory();
        } else if (osName.contains("mac")) {
            System.out.println("\nDetected Mac OS - Using Mac Factory");
            factory = new MacFactory();
        } else {
            System.out.println("\nUnknown OS - Defaulting to Windows Factory");
            factory = new WindowsFactory();
        }

        // Create application with selected factory
        Application app = new Application(factory);
        app.render();
        app.interact();

        System.out.println("\n" + "=".repeat(50));
        System.out.println("\n--- Demonstrating Factory Switch ---");

        // Demonstrate switching to a different factory
        System.out.println("\nCreating application with Mac Factory:");
        Application macApp = new Application(new MacFactory());
        macApp.render();
        macApp.interact();

        System.out.println("\n" + "=".repeat(50));
        System.out.println("\nCreating application with Windows Factory:");
        Application winApp = new Application(new WindowsFactory());
        winApp.render();
        winApp.interact();
    }
}
