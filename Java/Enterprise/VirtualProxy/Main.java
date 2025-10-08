package Enterprise.VirtualProxy;

/**
 * VirtualProxy Pattern Demonstration
 *
 * An object that looks like another object but loads it lazily
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== VirtualProxy Pattern Demo ===\n");

        // Create implementation
        VirtualProxyImpl implementation = new VirtualProxyImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
