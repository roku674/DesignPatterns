package Microservices.CommandSideReplica;
import java.util.*;
public class WriteModel {
    private List<String> events = new ArrayList<>();
    
    public void createOrder(String orderId, String customerId, double amount) {
        String event = "ORDER_CREATED:" + orderId + ":" + customerId + ":" + amount;
        events.add(event);
        System.out.println("Event: " + event);
    }
    
    public void updateOrder(String orderId, String status) {
        String event = "ORDER_UPDATED:" + orderId + ":" + status;
        events.add(event);
        System.out.println("Event: " + event);
    }
    
    public List<String> getEvents() { return events; }
}
