package Enterprise.VirtualProxy;

/**
 * VirtualProxy Pattern Implementation
 *
 * An object that looks like another object but loads it lazily
 */
public class VirtualProxyImpl {

    /**
     * Demonstrates the VirtualProxy pattern in action.
     */
    public void demonstrate() {
        System.out.println("Executing VirtualProxy pattern...");
        execute();
    }

    /**
     * Core pattern implementation.
     */
    private void execute() {
        System.out.println("Pattern logic executed successfully");
    }
}
