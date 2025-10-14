package Microservices.MultipleServicesPerHost;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Multiple Services Per Host Pattern ===\n");
        
        Host host = new Host("host-prod-01");
        
        host.deployService("OrderService", 8080);
        host.deployService("PaymentService", 8081);
        host.deployService("ShippingService", 8082);
        
        host.showStatus();
        
        System.out.println("\nStopping PaymentService...");
        host.stopService("PaymentService");
        
        host.showStatus();
    }
}
