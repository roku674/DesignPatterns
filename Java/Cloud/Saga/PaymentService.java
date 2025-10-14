package Cloud.Saga;
public class PaymentService {
    private boolean willFail = false;
    public void setWillFail(boolean fail) { this.willFail = fail; }
    public String charge(String customerId, double amount) throws Exception {
        if (willFail) throw new Exception("Payment failed: insufficient funds");
        return "Charged $" + amount + " to " + customerId;
    }
    public String refund(String customerId, double amount) { return "Refunded $" + amount; }
}
