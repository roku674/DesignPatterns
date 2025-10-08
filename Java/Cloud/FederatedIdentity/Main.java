package Cloud.FederatedIdentity;

/**
 * FederatedIdentity Pattern Demonstration
 *
 * Delegates authentication to external identity provider
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== FederatedIdentity Pattern Demo ===\n");

        // Create implementation
        FederatedIdentityImpl implementation = new FederatedIdentityImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
