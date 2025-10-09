/**
 * Main class to demonstrate Proxy pattern with real HTTP caching
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Proxy Pattern Demo - HTTP Caching Proxy ===\n");

        try {
            // Create proxies (no actual loading yet - lazy initialization)
            System.out.println(">>> Creating image proxies (lazy initialization)");
            Image image1 = new ProxyImage("https://api.github.com/users/github");
            Image image2 = new ProxyImage("https://api.github.com/users/torvalds");
            System.out.println("Proxies created! No HTTP requests made yet.\n");

            // First access - triggers actual loading
            System.out.println(">>> First access to image1 (should load from API)");
            String data1 = image1.display();
            System.out.println("Data length: " + data1.length() + " characters\n");

            // Second access - uses cache
            System.out.println(">>> Second access to image1 (should use cache)");
            String data1Again = image1.display();
            System.out.println("Data length: " + data1Again.length() + " characters\n");

            // Third access - still cached
            System.out.println(">>> Third access to image1 (should still use cache)");
            image1.display();
            System.out.println();

            // Access different resource
            System.out.println(">>> First access to image2 (new resource, loads from API)");
            String data2 = image2.display();
            System.out.println("Data length: " + data2.length() + " characters\n");

            // Access image2 again
            System.out.println(">>> Second access to image2 (should use cache)");
            image2.display();
            System.out.println();

            // Show cache statistics
            ProxyImage.printCacheStats();

            // Wait for cache to expire
            System.out.println("\n>>> Waiting 6 seconds for cache to expire...");
            Thread.sleep(6000);

            System.out.println(">>> Accessing image1 after cache expiry (should reload)");
            image1.display();

            // Final statistics
            ProxyImage.printCacheStats();

            System.out.println("\n" + "=".repeat(50));
            System.out.println("\nProxy Pattern Benefits:");
            System.out.println("- Lazy initialization - HTTP request only when needed");
            System.out.println("- Caching - reduces network calls and improves performance");
            System.out.println("- Resource management - controls expensive operations");
            System.out.println("- Transparent to client - same interface as real object");

            System.out.println("\nProxy Pattern Types:");
            System.out.println("1. Virtual Proxy (demonstrated here) - lazy loading");
            System.out.println("2. Protection Proxy - access control");
            System.out.println("3. Remote Proxy - represents object in different address space");
            System.out.println("4. Smart Proxy - additional housekeeping (reference counting, etc.)");

            System.out.println("\nReal-world usage:");
            System.out.println("- HTTP caching proxies (Nginx, Varnish)");
            System.out.println("- ORM lazy loading (Hibernate)");
            System.out.println("- Image loading in UI frameworks");
            System.out.println("- API rate limiting and throttling");
            System.out.println("- Security proxies for access control");

        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
