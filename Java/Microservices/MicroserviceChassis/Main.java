package Microservices.MicroserviceChassis;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Microservice Chassis Pattern ===\n");
        
        ServiceChassis chassis = new ServiceChassis("OrderService");
        chassis.initialize();
        
        System.out.println("\nProcessing requests...");
        chassis.handleRequest("/api/orders", "POST");
        chassis.handleRequest("/api/orders/123", "GET");
        
        System.out.println("\nShutting down...");
        chassis.shutdown();
    }
}
