package Microservices.TransactionOutbox;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Transaction Outbox Pattern ===\n");
        
        OrderService orderService = new OrderService();
        MessageRelay relay = new MessageRelay(orderService);
        
        System.out.println("=== Creating Order (with outbox) ===");
        orderService.createOrder("CUST-123", 299.99);
        
        System.out.println("\n=== Message Relay Publishing Events ===");
        relay.publishPendingMessages();
    }
}
