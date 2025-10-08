/**
 * Main class to demonstrate Proxy pattern
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Proxy Pattern Demo ===\n");

        System.out.println("Creating image proxies (not loading actual images yet):");
        Image image1 = new ProxyImage("photo1.jpg");
        Image image2 = new ProxyImage("photo2.jpg");
        System.out.println("Proxies created!\n");

        System.out.println("--- First Display (triggers loading) ---");
        image1.display();

        System.out.println("\n--- Second Display (uses cached image) ---");
        image1.display();

        System.out.println("\n--- Display different image ---");
        image2.display();

        System.out.println("\n" + "=".repeat(50));
        System.out.println("\nProxy Pattern Benefits:");
        System.out.println("- Lazy initialization - image loaded only when needed");
        System.out.println("- Caching - image loaded once, reused multiple times");
        System.out.println("- Resource management - expensive operations delayed");
    }
}
