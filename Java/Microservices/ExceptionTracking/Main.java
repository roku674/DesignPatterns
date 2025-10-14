package Microservices.ExceptionTracking;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Exception Tracking Pattern ===\n");
        
        ExceptionTracker tracker = new ExceptionTracker();
        
        try {
            throw new RuntimeException("Database connection failed");
        } catch (Exception e) {
            tracker.trackException(e, "OrderService", "createOrder");
        }
        
        try {
            throw new IllegalArgumentException("Invalid product ID");
        } catch (Exception e) {
            tracker.trackException(e, "ProductService", "getProduct");
        }
        
        tracker.showDashboard();
    }
}
