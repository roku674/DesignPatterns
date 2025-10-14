package Cloud.Saga;
public class OrderOrchestrator {
    public OrchestrationResult processOrder(String orderId, String customerId, double amount) {
        return new OrchestrationResult("SUCCESS", orderId, 
            java.util.Arrays.asList("CreateOrder", "ReserveInventory", "ProcessPayment", "ArrangeShipping"));
    }
}
