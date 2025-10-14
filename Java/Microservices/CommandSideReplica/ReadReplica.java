package Microservices.CommandSideReplica;
import java.util.*;
public class ReadReplica {
    private Map<String, OrderView> orders = new HashMap<>();
    
    public void replicate(List<String> events) {
        System.out.println("Replicating " + events.size() + " events to read model...");
        for (String event : events) {
            String[] parts = event.split(":");
            if (parts[0].equals("ORDER_CREATED")) {
                orders.put(parts[1], new OrderView(parts[1], parts[2], Double.parseDouble(parts[3]), "CREATED"));
            } else if (parts[0].equals("ORDER_UPDATED")) {
                OrderView order = orders.get(parts[1]);
                if (order != null) {
                    order.status = parts[2];
                }
            }
        }
        System.out.println("Replication complete!");
    }
    
    public void queryOrder(String orderId) {
        OrderView order = orders.get(orderId);
        System.out.println("Query result: " + order);
    }
    
    public void queryCustomerOrders(String customerId) {
        System.out.println("Orders for customer " + customerId + ":");
        orders.values().stream()
            .filter(o -> o.customerId.equals(customerId))
            .forEach(o -> System.out.println("  " + o));
    }
}
class OrderView {
    String orderId, customerId, status;
    double amount;
    OrderView(String orderId, String customerId, double amount, String status) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.amount = amount;
        this.status = status;
    }
    public String toString() {
        return String.format("Order[%s, customer=%s, amount=%.2f, status=%s]", orderId, customerId, amount, status);
    }
}
