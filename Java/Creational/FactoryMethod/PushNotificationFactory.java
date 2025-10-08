/**
 * Concrete Creator - creates Push notifications
 */
public class PushNotificationFactory extends NotificationFactory {

    private String deviceToken;

    public PushNotificationFactory(String deviceToken) {
        this.deviceToken = deviceToken;
    }

    @Override
    public Notification createNotification() {
        return new PushNotification(deviceToken);
    }
}
