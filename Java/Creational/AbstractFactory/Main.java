import javax.swing.SwingUtilities;

/**
 * Main class to demonstrate the Abstract Factory pattern with real GUI windows
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("=== Abstract Factory Pattern - Real Swing GUI Demo ===\n");

        // Simulate OS detection
        String osName = System.getProperty("os.name").toLowerCase();
        System.out.println("Detected OS: " + System.getProperty("os.name"));
        System.out.println();

        // Run GUI creation on Swing event dispatch thread
        SwingUtilities.invokeLater(() -> {
            try {
                // Example 1: OS-based factory selection
                System.out.println("--- Example 1: OS-Based Factory Selection ---");
                GUIFactory autoFactory = selectFactoryBasedOnOS(osName);
                Application autoApp = new Application(autoFactory);
                System.out.println("Creating " + autoApp.getTheme() + " style application...");
                autoApp.show();
                System.out.println();

                // Wait a bit before showing next window
                Thread.sleep(500);

                // Example 2: Windows-style application
                System.out.println("--- Example 2: Windows Style Application ---");
                GUIFactory windowsFactory = new WindowsFactory();
                Application windowsApp = new Application(windowsFactory);
                windowsApp.show();
                System.out.println();

                Thread.sleep(500);

                // Example 3: Mac-style application
                System.out.println("--- Example 3: Mac Style Application ---");
                GUIFactory macFactory = new MacFactory();
                Application macApp = new Application(macFactory);
                macApp.show();
                System.out.println();

                // Example 4: Runtime factory selection
                System.out.println("--- Example 4: Runtime Theme Selection ---");
                String userPreference = "Mac"; // Could come from configuration
                GUIFactory userFactory = getUserPreferredFactory(userPreference);
                Application userApp = new Application(userFactory);
                System.out.println("User prefers: " + userPreference);
                userApp.show();
                System.out.println();

                // Example 5: Demonstrate component compatibility
                System.out.println("--- Example 5: Factory Component Compatibility ---");
                demonstrateCompatibility();

                System.out.println("=== All GUI windows displayed ===");
                System.out.println("Interact with the windows to see the Abstract Factory pattern in action!");
                System.out.println("Close any window to exit.");

            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });
    }

    /**
     * Selects factory based on operating system
     */
    private static GUIFactory selectFactoryBasedOnOS(String osName) {
        if (osName.contains("win")) {
            System.out.println("OS is Windows - Using WindowsFactory");
            return new WindowsFactory();
        } else if (osName.contains("mac")) {
            System.out.println("OS is Mac - Using MacFactory");
            return new MacFactory();
        } else {
            System.out.println("Unknown OS - Defaulting to WindowsFactory");
            return new WindowsFactory();
        }
    }

    /**
     * Gets factory based on user preference
     */
    private static GUIFactory getUserPreferredFactory(String preference) {
        switch (preference.toLowerCase()) {
            case "mac":
                return new MacFactory();
            case "windows":
                return new WindowsFactory();
            default:
                return new WindowsFactory();
        }
    }

    /**
     * Demonstrates that components from the same factory are compatible
     */
    private static void demonstrateCompatibility() {
        System.out.println("Testing component compatibility...");

        // Windows factory creates compatible components
        GUIFactory windowsFactory = new WindowsFactory();
        Button windowsButton = windowsFactory.createButton();
        Checkbox windowsCheckbox = windowsFactory.createCheckbox();
        System.out.println("Windows Button style: " + windowsButton.getStyle());
        System.out.println("Windows Checkbox style: " + windowsCheckbox.getStyle());
        System.out.println("Both components use the same Windows style!");
        System.out.println();

        // Mac factory creates compatible components
        GUIFactory macFactory = new MacFactory();
        Button macButton = macFactory.createButton();
        Checkbox macCheckbox = macFactory.createCheckbox();
        System.out.println("Mac Button style: " + macButton.getStyle());
        System.out.println("Mac Checkbox style: " + macCheckbox.getStyle());
        System.out.println("Both components use the same Mac style!");
        System.out.println();
    }
}
