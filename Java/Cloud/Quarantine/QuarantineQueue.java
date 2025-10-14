package Cloud.Quarantine;
import java.util.*;

public class QuarantineQueue {
    private List<Message> quarantined = new ArrayList<>();
    
    public void quarantine(Message message) {
        quarantined.add(message);
        System.out.println("  [Quarantine] Isolated message: " + message.getId());
    }
    
    public void showQuarantined() {
        System.out.println("  Total quarantined: " + quarantined.size());
        for (Message msg : quarantined) {
            System.out.println("    - " + msg.getId() + " (retries: " + msg.getRetryCount() + ")");
        }
    }
}
