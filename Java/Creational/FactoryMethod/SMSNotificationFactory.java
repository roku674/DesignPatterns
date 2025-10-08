/**
 * Concrete Creator - creates SMS notifications
 */
public class SMSNotificationFactory extends NotificationFactory {

    private String phoneNumber;

    public SMSNotificationFactory(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    @Override
    public Notification createNotification() {
        return new SMSNotification(phoneNumber);
    }
}
