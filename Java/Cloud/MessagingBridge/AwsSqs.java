package Cloud.MessagingBridge;
import java.util.*;

public class AwsSqs {
    private Queue<String> messages = new LinkedList<>();
    
    public void send(String queueName, String message) {
        messages.offer(message);
        System.out.println("  [AWS] Sent to queue '" + queueName + "': " + message);
    }
    
    public String receive() {
        String msg = messages.poll();
        if (msg != null) {
            System.out.println("  [AWS] Received: " + msg);
        }
        return msg;
    }
}
