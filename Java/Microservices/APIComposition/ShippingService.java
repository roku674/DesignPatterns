package Microservices.APIComposition;
public class ShippingService {
    public Shipping getShipping(String orderId) {
        simulateDelay(80);
        return new Shipping(orderId, "Standard", "In Transit", "2024-01-25");
    }
    private void simulateDelay(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}
class Shipping {
    private String orderId, method, status, estimatedDelivery;
    public Shipping(String orderId, String method, String status, String estimatedDelivery) {
        this.orderId = orderId; this.method = method; this.status = status; this.estimatedDelivery = estimatedDelivery;
    }
    public String toString() { return String.format("Shipping{method='%s', status='%s', ETA='%s'}", method, status, estimatedDelivery); }
}
