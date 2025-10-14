package Microservices.ClientSideDiscovery;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Client-Side Discovery Pattern ===\n");
        
        ServiceRegistry registry = new ServiceRegistry();
        registry.register("UserService", "192.168.1.10:8080");
        registry.register("UserService", "192.168.1.11:8080");
        registry.register("OrderService", "192.168.1.20:8080");
        
        ServiceClient client = new ServiceClient(registry);
        client.callService("UserService", "/api/users/123");
        client.callService("UserService", "/api/users/456");
        client.callService("OrderService", "/api/orders/789");
    }
}
