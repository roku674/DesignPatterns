package Microservices.ServiceComponentTest;
import java.util.*;
public class OrderService {
    private Map<String, Order> orders = new HashMap<>();
    
    public String createOrder(String customerId, double amount) {
        String orderId = "ORDER-" + UUID.randomUUID().toString().substring(0, 8);
        orders.put(orderId, new Order(orderId, customerId, amount));
        return orderId;
    }
    
    public Order getOrder(String orderId) {
        return orders.get(orderId);
    }
}
class Order {
    String orderId, customerId;
    double amount;
    Order(String orderId, String customerId, double amount) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.amount = amount;
    }
}
