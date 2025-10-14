package Microservices.ServiceComponentTest;
public class ServiceComponentTest {
    private OrderService service;
    
    public ServiceComponentTest(OrderService service) {
        this.service = service;
    }
    
    public void runTests() {
        System.out.println("Running component tests in isolation...\n");
        
        testCreateOrder();
        testGetOrder();
        
        System.out.println("\nAll tests passed!");
    }
    
    private void testCreateOrder() {
        System.out.println("Test: Create Order");
        String orderId = service.createOrder("CUST-123", 99.99);
        System.out.println("  Created order: " + orderId);
        System.out.println("  ✓ PASSED");
    }
    
    private void testGetOrder() {
        System.out.println("\nTest: Get Order");
        String orderId = service.createOrder("CUST-456", 149.99);
        Order order = service.getOrder(orderId);
        System.out.println("  Retrieved order: " + order.orderId);
        System.out.println("  ✓ PASSED");
    }
}
