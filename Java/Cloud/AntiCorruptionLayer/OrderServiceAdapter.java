package Cloud.AntiCorruptionLayer;
import java.util.Map;

public class OrderServiceAdapter {
    private final LegacyOrderSystem legacy;
    
    public OrderServiceAdapter(LegacyOrderSystem legacy) {
        this.legacy = legacy;
    }
    
    public void createOrder(String orderId, String customerEmail, double amount) {
        System.out.println("  [ACL] Translating modern request to legacy format");
        legacy.INSERT_ORDER_RECORD(orderId, customerEmail, amount, "PENDING");
    }
    
    public String getOrderStatus(String orderId) {
        System.out.println("  [ACL] Translating legacy response to modern format");
        Map<String, Object> legacyOrder = legacy.GET_ORDER_BY_NUM(orderId);
        if (legacyOrder != null) {
            return (String) legacyOrder.get("STAT");
        }
        return "NOT_FOUND";
    }
}
