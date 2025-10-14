package Microservices.TransactionOutbox;
import java.util.*;
public class OrderService {
    private List<OutboxMessage> outbox = new ArrayList<>();
    
    public void createOrder(String customerId, double amount) {
        System.out.println("Starting database transaction...");
        
        String orderId = "ORDER-" + UUID.randomUUID().toString().substring(0, 8);
        System.out.println("  1. Insert order: " + orderId);
        
        OutboxMessage message = new OutboxMessage(
            "ORDER_CREATED",
            "{orderId: '" + orderId + "', customerId: '" + customerId + "', amount: " + amount + "}"
        );
        outbox.add(message);
        System.out.println("  2. Insert outbox message: " + message.eventType);
        
        System.out.println("Transaction committed!");
    }
    
    public List<OutboxMessage> getOutboxMessages() {
        return new ArrayList<>(outbox);
    }
    
    public void markAsPublished(OutboxMessage message) {
        outbox.remove(message);
    }
}
class OutboxMessage {
    String eventType, payload;
    OutboxMessage(String eventType, String payload) {
        this.eventType = eventType;
        this.payload = payload;
    }
}
