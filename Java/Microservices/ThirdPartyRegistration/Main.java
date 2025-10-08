package Microservices.ThirdPartyRegistration;

/**
 * ThirdPartyRegistration Pattern Demonstration
 *
 * Third party registers service instances
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ThirdPartyRegistration Pattern Demo ===\n");

        // Create implementation
        ThirdPartyRegistrationImpl implementation = new ThirdPartyRegistrationImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
