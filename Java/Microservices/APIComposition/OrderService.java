package Microservices.APIComposition;
import java.util.*;
public class OrderService {
    public Order getOrder(String orderId) {
        simulateDelay(120);
        return new Order(orderId, "2024-01-15", "Processing", 299.99);
    }
    public List<Order> getUserOrders(String userId) {
        simulateDelay(150);
        List<Order> orders = new ArrayList<>();
        orders.add(new Order("ORDER-1", "2024-01-15", "Delivered", 149.99));
        orders.add(new Order("ORDER-2", "2024-01-20", "Processing", 299.99));
        return orders;
    }
    private void simulateDelay(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}
class Order {
    private String id, date, status;
    private double total;
    public Order(String id, String date, String status, double total) {
        this.id = id; this.date = date; this.status = status; this.total = total;
    }
    public String getId() { return id; }
    public String getStatus() { return status; }
    public String toString() { return String.format("Order{id='%s', status='%s', total=$%.2f}", id, status, total); }
}
