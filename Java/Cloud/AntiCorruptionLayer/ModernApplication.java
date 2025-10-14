package Cloud.AntiCorruptionLayer;

public class ModernApplication {
    private final OrderServiceAdapter orderService;
    
    public ModernApplication(OrderServiceAdapter orderService) {
        this.orderService = orderService;
    }
    
    public void createOrder(String orderId, String customerEmail, double amount) {
        System.out.println("  [Modern] Creating order: " + orderId);
        orderService.createOrder(orderId, customerEmail, amount);
    }
    
    public void getOrderStatus(String orderId) {
        System.out.println("  [Modern] Getting status: " + orderId);
        String status = orderService.getOrderStatus(orderId);
        System.out.println("  [Modern] Status: " + status);
    }
}
