package Integration.ChannelPurger;

/**
 * ChannelPurger Pattern Demonstration
 *
 * Removes unwanted messages from channel
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ChannelPurger Pattern Demo ===\n");

        // Create implementation
        ChannelPurgerImpl implementation = new ChannelPurgerImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
