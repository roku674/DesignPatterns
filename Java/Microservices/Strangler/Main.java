package Microservices.Strangler;

/**
 * Strangler Pattern Demonstration
 *
 * Gradually replaces legacy system by intercepting calls and routing
 * to new microservices while keeping legacy system running.
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Strangler Pattern Demo ===\n");

        LegacySystem legacy = new LegacySystem();
        NewMicroservice newService = new NewMicroservice();
        StranglerFacade facade = new StranglerFacade(legacy, newService);

        System.out.println("Phase 1: All requests to legacy");
        System.out.println("-".repeat(50));
        facade.setMigrationPercent(0);
        facade.handleRequest("/api/users/123");
        facade.handleRequest("/api/products/456");

        System.out.println("\nPhase 2: 50% migrated to new service");
        System.out.println("-".repeat(50));
        facade.setMigrationPercent(50);
        for (int i = 0; i < 6; i++) {
            facade.handleRequest("/api/orders/" + i);
        }

        System.out.println("\nPhase 3: 100% migrated to new service");
        System.out.println("-".repeat(50));
        facade.setMigrationPercent(100);
        facade.handleRequest("/api/users/789");
        facade.handleRequest("/api/products/012");

        System.out.println("\n=== Migration Statistics ===");
        facade.showStats();

        System.out.println("\n=== Pattern demonstration complete ===");
    }
}
