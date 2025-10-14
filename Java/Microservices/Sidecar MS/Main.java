package Microservices.SidecarMS;

/**
 * Sidecar Pattern Demonstration
 *
 * Deploys helper components alongside main service for cross-cutting concerns
 * like logging, monitoring, configuration, and service mesh functionality.
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Sidecar Pattern Demo ===\n");

        System.out.println("Deploying service with sidecar...");
        
        MainService mainService = new MainService("OrderService");
        Sidecar sidecar = new Sidecar();
        
        sidecar.attachLoggingProxy();
        sidecar.attachMetricsCollector();
        sidecar.attachConfigWatcher();
        sidecar.attachServiceMeshProxy();
        
        System.out.println("\n=== Processing Requests ===");
        sidecar.interceptRequest("GET /api/orders/123");
        mainService.processRequest("GET /api/orders/123");
        sidecar.interceptResponse("200 OK");
        
        System.out.println("\n=== Sidecar Functionality ===");
        sidecar.showMetrics();
        
        System.out.println("\n=== Pattern demonstration complete ===");
    }
}
