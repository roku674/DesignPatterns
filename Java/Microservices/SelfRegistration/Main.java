package Microservices.SelfRegistration;

/**
 * SelfRegistration Pattern Demonstration
 *
 * Service instance registers itself
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== SelfRegistration Pattern Demo ===\n");

        // Create implementation
        SelfRegistrationImpl implementation = new SelfRegistrationImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
