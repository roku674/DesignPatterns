/**
 * Concrete Creator - creates Email notifications
 */
public class EmailNotificationFactory extends NotificationFactory {

    private String emailAddress;

    public EmailNotificationFactory(String emailAddress) {
        this.emailAddress = emailAddress;
    }

    @Override
    public Notification createNotification() {
        return new EmailNotification(emailAddress);
    }
}
