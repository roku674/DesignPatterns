package Cloud.AntiCorruptionLayer;
import java.util.*;

public class LegacyOrderSystem {
    private Map<String, Map<String, Object>> orders = new HashMap<>();
    
    public void INSERT_ORDER_RECORD(String orderNum, String custEmail, double amt, String stat) {
        Map<String, Object> order = new HashMap<>();
        order.put("ORDER_NUM", orderNum);
        order.put("CUST_EMAIL", custEmail);
        order.put("AMT", amt);
        order.put("STAT", stat);
        orders.put(orderNum, order);
        System.out.println("  [Legacy] Inserted: " + orderNum);
    }
    
    public Map<String, Object> GET_ORDER_BY_NUM(String orderNum) {
        System.out.println("  [Legacy] Retrieved: " + orderNum);
        return orders.get(orderNum);
    }
}
