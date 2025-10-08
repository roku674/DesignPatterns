/**
 * Concrete Product - Push notification implementation
 */
public class PushNotification implements Notification {

    private String deviceToken;

    public PushNotification(String deviceToken) {
        this.deviceToken = deviceToken;
    }

    @Override
    public void send(String message) {
        System.out.println("Sending PUSH notification to device: " + deviceToken);
        System.out.println("Message: " + message);
        System.out.println("Push notification sent successfully!\n");
    }

    @Override
    public String getType() {
        return "PUSH";
    }
}
