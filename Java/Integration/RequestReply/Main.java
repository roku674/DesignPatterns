package Integration.RequestReply;

/**
 * RequestReply Pattern Demonstration
 *
 * Sends request and expects reply
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== RequestReply Pattern Demo ===\n");

        // Create implementation
        RequestReplyImpl implementation = new RequestReplyImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
