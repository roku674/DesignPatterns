/**
 * Main class to demonstrate Chain of Responsibility pattern
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Chain of Responsibility Pattern Demo ===\n");

        // Create handlers
        SupportHandler level1 = new Level1Support();
        SupportHandler level2 = new Level2Support();
        SupportHandler level3 = new Level3Support();

        // Build chain
        level1.setNext(level2);
        level2.setNext(level3);

        // Test different priority issues
        System.out.println("--- Issue 1: Priority 1 ---");
        level1.handleRequest("Password reset", 1);

        System.out.println("\n--- Issue 2: Priority 2 ---");
        level1.handleRequest("Software installation", 2);

        System.out.println("\n--- Issue 3: Priority 3 ---");
        level1.handleRequest("Server down", 3);

        System.out.println("\n" + "=".repeat(50));
        System.out.println("\nChain of Responsibility Benefits:");
        System.out.println("- Decouples sender and receiver");
        System.out.println("- Flexible assignment of responsibilities");
        System.out.println("- Easy to add new handlers");
    }
}
