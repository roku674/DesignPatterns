package Cloud.Saga;
import java.util.List;
public class OrchestrationResult {
    private final String status;
    private final String orderId;
    private final List<String> steps;
    public OrchestrationResult(String status, String orderId, List<String> steps) {
        this.status = status; this.orderId = orderId; this.steps = steps;
    }
    public String getStatus() { return status; }
    public String getOrderId() { return orderId; }
    public List<String> getSteps() { return steps; }
}
