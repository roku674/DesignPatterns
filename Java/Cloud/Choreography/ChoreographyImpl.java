package Cloud.Choreography;

/**
 * Choreography Pattern Implementation
 *
 * Lets each service decide when and how to react to events
 */
public class ChoreographyImpl {

    /**
     * Demonstrates the Choreography pattern in action.
     */
    public void demonstrate() {
        System.out.println("Executing Choreography pattern...");
        execute();
    }

    /**
     * Core pattern implementation.
     */
    private void execute() {
        System.out.println("Pattern logic executed successfully");
    }
}
