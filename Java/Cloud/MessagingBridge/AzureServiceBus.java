package Cloud.MessagingBridge;
import java.util.*;

public class AzureServiceBus {
    private Queue<String> messages = new LinkedList<>();
    
    public void send(String topic, String message) {
        messages.offer(message);
        System.out.println("  [Azure] Sent to topic '" + topic + "': " + message);
    }
    
    public String receive() {
        return messages.poll();
    }
    
    public boolean hasMessages() {
        return !messages.isEmpty();
    }
}
