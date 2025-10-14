package Microservices.APIComposition;
public class PaymentService {
    public Payment getPayment(String orderId) {
        simulateDelay(70);
        return new Payment(orderId, "Visa-1234", "Completed", 299.99);
    }
    private void simulateDelay(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}
class Payment {
    private String orderId, method, status;
    private double amount;
    public Payment(String orderId, String method, String status, double amount) {
        this.orderId = orderId; this.method = method; this.status = status; this.amount = amount;
    }
    public String toString() { return String.format("Payment{method='%s', status='%s', amount=$%.2f}", method, status, amount); }
}
