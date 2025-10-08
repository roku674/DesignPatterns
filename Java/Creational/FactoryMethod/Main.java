/**
 * Main class to demonstrate the Factory Method pattern
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("=== Factory Method Pattern Demo ===\n");

        // Create different notification factories
        NotificationFactory emailFactory = new EmailNotificationFactory("user@example.com");
        NotificationFactory smsFactory = new SMSNotificationFactory("+1-555-1234");
        NotificationFactory pushFactory = new PushNotificationFactory("device-token-xyz123");

        // Send notifications using different factories
        System.out.println("--- Email Notification ---");
        emailFactory.notifyUser("Your order has been shipped!");

        System.out.println("--- SMS Notification ---");
        smsFactory.notifyUser("Your verification code is: 123456");

        System.out.println("--- Push Notification ---");
        pushFactory.notifyUser("New message received!");

        // Demonstrate runtime selection
        System.out.println("--- Runtime Selection Demo ---");
        String notificationType = "EMAIL"; // This could come from user preferences or configuration
        NotificationFactory factory = getNotificationFactory(notificationType);
        factory.notifyUser("This is a dynamically selected notification!");
    }

    /**
     * Helper method to demonstrate runtime factory selection
     *
     * @param type the type of notification to create
     * @return the appropriate notification factory
     */
    private static NotificationFactory getNotificationFactory(String type) {
        switch (type.toUpperCase()) {
            case "EMAIL":
                return new EmailNotificationFactory("dynamic@example.com");
            case "SMS":
                return new SMSNotificationFactory("+1-555-9999");
            case "PUSH":
                return new PushNotificationFactory("dynamic-device-token");
            default:
                return new EmailNotificationFactory("default@example.com");
        }
    }
}
