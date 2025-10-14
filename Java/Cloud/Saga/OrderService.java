package Cloud.Saga;
public class OrderService {
    public String createOrder(String orderId, String customerId) { return "Order " + orderId + " created"; }
    public String cancelOrder(String orderId) { return "Order " + orderId + " cancelled"; }
    public String validateCart(String cartId) { return "Cart validated"; }
    public String applyDiscount(String orderId, double amount) { return "Discount applied"; }
    public String removeDiscount(String orderId) { return "Discount removed"; }
}
