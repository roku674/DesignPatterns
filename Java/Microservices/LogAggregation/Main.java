package Microservices.LogAggregation;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Log Aggregation Pattern ===\n");
        
        LogAggregator aggregator = new LogAggregator();
        
        aggregator.receiveLog("OrderService", "INFO", "Order created: order-123");
        aggregator.receiveLog("PaymentService", "INFO", "Payment processed: $99.99");
        aggregator.receiveLog("OrderService", "ERROR", "Failed to update inventory");
        aggregator.receiveLog("ShippingService", "INFO", "Shipping label created");
        aggregator.receiveLog("PaymentService", "WARN", "Payment retry attempt 2");
        
        System.out.println("\n=== Searching Logs ===");
        aggregator.search("OrderService");
        
        System.out.println("\n=== Error Analysis ===");
        aggregator.analyzeErrors();
    }
}
