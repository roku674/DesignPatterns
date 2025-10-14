package Microservices.ServerSideDiscovery;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Server-Side Discovery Pattern ===\n");
        
        ServiceRegistry registry = new ServiceRegistry();
        registry.register("OrderService", "192.168.1.10:8080");
        registry.register("OrderService", "192.168.1.11:8080");
        registry.register("PaymentService", "192.168.1.20:8080");
        
        LoadBalancer loadBalancer = new LoadBalancer(registry);
        
        System.out.println("\nClient requests (via load balancer):");
        loadBalancer.forward("OrderService", "/api/orders");
        loadBalancer.forward("OrderService", "/api/orders/123");
        loadBalancer.forward("PaymentService", "/api/payments");
    }
}
