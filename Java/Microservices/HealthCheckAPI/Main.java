package Microservices.HealthCheckAPI;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Health Check API Pattern ===\n");
        
        ServiceHealth orderService = new ServiceHealth("OrderService");
        orderService.addCheck(new DatabaseCheck());
        orderService.addCheck(new CacheCheck());
        orderService.addCheck(new ExternalAPICheck());
        
        System.out.println("Performing health check...");
        HealthStatus status = orderService.checkHealth();
        
        System.out.println("\n" + status);
    }
}
