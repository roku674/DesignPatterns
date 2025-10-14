package Microservices.APIGateway;
import java.util.*;
public class Gateway {
    private Map<String, String> routes = new HashMap<>();
    private int requestCount = 0;
    public Gateway() {
        routes.put("/api/users", "UserService");
        routes.put("/api/products", "ProductService");
        routes.put("/api/orders", "OrderService");
    }
    public void route(String path, String method) {
        requestCount++;
        String service = findService(path);
        System.out.println(method + " " + path + " -> " + service);
        authenticate();
        rateLimit();
        logRequest(path);
    }
    private String findService(String path) {
        for (Map.Entry<String, String> entry : routes.entrySet()) {
            if (path.startsWith(entry.getKey())) {
                return entry.getValue();
            }
        }
        return "Unknown";
    }
    private void authenticate() { System.out.println("  [Auth] Token validated"); }
    private void rateLimit() { System.out.println("  [RateLimit] Check passed"); }
    private void logRequest(String path) { System.out.println("  [Log] Request logged\n"); }
    public void showMetrics() { System.out.println("Total requests: " + requestCount); }
}
