package Enterprise.IdentityMap;
import java.util.*;
public class Order {
    private Long id;
    private Long customerId;
    private List<OrderItem> items = new ArrayList<>();
    public Order(Long id, Long customerId) {
        this.id = id;
        this.customerId = customerId;
    }
    public Long getId() { return id; }
    public Long getCustomerId() { return customerId; }
    public List<OrderItem> getItems() { return items; }
    public void addItem(OrderItem item) { items.add(item); }
}
