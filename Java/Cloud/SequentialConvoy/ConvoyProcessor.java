package Cloud.SequentialConvoy;
import java.util.*;

public class ConvoyProcessor {
    private Map<String, List<ConvoyMessage>> convoys = new HashMap<>();
    
    public void enqueue(ConvoyMessage message) {
        convoys.computeIfAbsent(message.getConvoyId(), k -> new ArrayList<>()).add(message);
        System.out.println("  Enqueued: " + message.getConvoyId() + " - " + message.getAction());
    }
    
    public void processConvoys() {
        for (String convoyId : convoys.keySet()) {
            List<ConvoyMessage> messages = convoys.get(convoyId);
            messages.sort(Comparator.comparingInt(ConvoyMessage::getSequenceNumber));
            
            System.out.println("\n  Processing convoy: " + convoyId);
            for (ConvoyMessage msg : messages) {
                System.out.println("    [" + msg.getSequenceNumber() + "] " + msg.getAction());
            }
        }
    }
}
