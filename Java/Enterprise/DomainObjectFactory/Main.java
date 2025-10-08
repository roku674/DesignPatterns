package Enterprise.DomainObjectFactory;

/**
 * DomainObjectFactory Pattern Demonstration
 *
 * Creates domain objects with proper initialization
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== DomainObjectFactory Pattern Demo ===\n");

        // Create implementation
        DomainObjectFactoryImpl implementation = new DomainObjectFactoryImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
