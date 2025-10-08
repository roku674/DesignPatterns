package Cloud.StaticContentHosting;

/**
 * StaticContentHosting Pattern Demonstration
 *
 * Deploys static content to cloud-based storage
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== StaticContentHosting Pattern Demo ===\n");

        // Create implementation
        StaticContentHostingImpl implementation = new StaticContentHostingImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
