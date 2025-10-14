package Microservices.TransactionOutbox;
import java.util.*;
public class MessageRelay {
    private OrderService orderService;
    
    public MessageRelay(OrderService orderService) {
        this.orderService = orderService;
    }
    
    public void publishPendingMessages() {
        List<OutboxMessage> messages = orderService.getOutboxMessages();
        
        for (OutboxMessage message : messages) {
            publishToMessageBroker(message);
            orderService.markAsPublished(message);
        }
    }
    
    private void publishToMessageBroker(OutboxMessage message) {
        System.out.println("Publishing to message broker:");
        System.out.println("  Event: " + message.eventType);
        System.out.println("  Payload: " + message.payload);
        System.out.println("  ✓ Published successfully");
    }
}
