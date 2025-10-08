/**
 * Concrete Product - SMS notification implementation
 */
public class SMSNotification implements Notification {

    private String phoneNumber;

    public SMSNotification(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    @Override
    public void send(String message) {
        System.out.println("Sending SMS to: " + phoneNumber);
        System.out.println("Message: " + message);
        System.out.println("SMS sent successfully!\n");
    }

    @Override
    public String getType() {
        return "SMS";
    }
}
