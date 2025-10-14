package Microservices.SingleServicePerHost;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Single Service Per Host Pattern ===\n");
        
        ServiceHost host1 = new ServiceHost("host-order-01");
        host1.deploy("OrderService", 8080);
        
        ServiceHost host2 = new ServiceHost("host-payment-01");
        host2.deploy("PaymentService", 8080);
        
        ServiceHost host3 = new ServiceHost("host-shipping-01");
        host3.deploy("ShippingService", 8080);
        
        System.out.println("\n=== Resource Isolation ===");
        host1.showResources();
        host2.showResources();
        host3.showResources();
    }
}
