package Cloud.Saga;
public class SagaEvent {
    private final String type;
    private final String orderId;
    public SagaEvent(String type, String orderId) { this.type = type; this.orderId = orderId; }
    public String getType() { return type; }
    public String getOrderId() { return orderId; }
}
