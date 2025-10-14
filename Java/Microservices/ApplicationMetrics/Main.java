package Microservices.ApplicationMetrics;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Application Metrics Pattern ===\n");
        MetricsCollector metrics = new MetricsCollector();
        
        for (int i = 0; i < 10; i++) {
            metrics.recordRequest("/api/users", 45 + i * 5);
            metrics.recordRequest("/api/products", 30 + i * 3);
        }
        
        metrics.recordError("/api/orders");
        metrics.showMetrics();
    }
}
