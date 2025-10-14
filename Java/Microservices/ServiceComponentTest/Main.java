package Microservices.ServiceComponentTest;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Service Component Test Pattern ===\n");
        
        OrderService orderService = new OrderService();
        ServiceComponentTest test = new ServiceComponentTest(orderService);
        
        test.runTests();
    }
}
