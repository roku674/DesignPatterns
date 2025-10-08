/**
 * Concrete Product - Email notification implementation
 */
public class EmailNotification implements Notification {

    private String emailAddress;

    public EmailNotification(String emailAddress) {
        this.emailAddress = emailAddress;
    }

    @Override
    public void send(String message) {
        System.out.println("Sending EMAIL to: " + emailAddress);
        System.out.println("Subject: Notification");
        System.out.println("Message: " + message);
        System.out.println("Email sent successfully!\n");
    }

    @Override
    public String getType() {
        return "EMAIL";
    }
}
