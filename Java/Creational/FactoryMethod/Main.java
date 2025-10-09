import javax.mail.MessagingException;

/**
 * Main class to demonstrate the Factory Method pattern with real notification sending
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("=== Factory Method Pattern - Real Notification System Demo ===\n");

        try {
            // Example 1: Email Notification
            System.out.println("--- Example 1: Email Notification ---");
            NotificationFactory emailFactory = new EmailNotificationFactory("user@example.com");
            emailFactory.notifyUser("Your order #12345 has been shipped and will arrive in 2-3 business days.");
            System.out.println();

            // Example 2: SMS Notification
            System.out.println("--- Example 2: SMS Notification ---");
            NotificationFactory smsFactory = new SMSNotificationFactory("+15551234567");
            smsFactory.notifyUser("Your verification code is: 789456. It will expire in 10 minutes.");
            System.out.println();

            // Example 3: Push Notification (Android)
            System.out.println("--- Example 3: Push Notification (Android) ---");
            String androidToken = "cXrY5mT9pLkJhGfDsAq1WxCvBnM8zYt4RpQlK7iUjHg6EdFaN3bVmXc2SoT0PwLe";
            NotificationFactory pushFactory = new PushNotificationFactory(androidToken);
            pushFactory.notifyUser("New message from John: Hey, are we still on for lunch?");
            System.out.println();

            // Example 4: Push Notification (iOS)
            System.out.println("--- Example 4: Push Notification (iOS) ---");
            String iosToken = "a1b2c3d4e5f6789012345678901234567890abcdefabcdefabcdefabcdef1234";
            NotificationFactory iosPushFactory = new PushNotificationFactory(iosToken);
            iosPushFactory.notifyUser("Your appointment is scheduled for tomorrow at 3:00 PM");
            System.out.println();

            // Example 5: Validation Demo
            System.out.println("--- Example 5: Notification Validation ---");
            demonstrateValidation();
            System.out.println();

            // Example 6: Runtime Selection
            System.out.println("--- Example 6: Runtime Factory Selection ---");
            String userPreference = "SMS"; // This could come from database/config
            NotificationFactory dynamicFactory = getNotificationFactory(userPreference, "+15559876543");
            dynamicFactory.notifyUser("This notification was sent based on user preference!");
            System.out.println();

            // Example 7: Batch Notifications
            System.out.println("--- Example 7: Batch Notifications ---");
            sendBatchNotifications();
            System.out.println();

            // Example 8: Error Handling Demo
            System.out.println("--- Example 8: Error Handling ---");
            demonstrateErrorHandling();

        } catch (MessagingException e) {
            System.err.println("Notification error: " + e.getMessage());
            e.printStackTrace();
        }

        System.out.println("\n=== Factory Method Pattern Demo Complete ===");
    }

    /**
     * Demonstrates validation functionality
     */
    private static void demonstrateValidation() throws MessagingException {
        // Valid email
        Notification email = new EmailNotification("valid.user@example.com");
        System.out.println("Email validation: " + email.validate());
        System.out.println("Recipient: " + email.getRecipient());

        // Valid phone number
        Notification sms = new SMSNotification("+1 (555) 123-4567");
        System.out.println("SMS validation: " + sms.validate());
        System.out.println("Normalized recipient: " + sms.getRecipient());

        // Valid device token
        String token = "abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yz567890abcdef12";
        Notification push = new PushNotification(token);
        System.out.println("Push validation: " + push.validate());
        if (push instanceof PushNotification) {
            System.out.println("Platform: " + ((PushNotification) push).getPlatform());
        }
    }

    /**
     * Demonstrates sending batch notifications
     */
    private static void sendBatchNotifications() throws MessagingException {
        String[] emailAddresses = {
            "customer1@example.com",
            "customer2@example.com",
            "customer3@example.com"
        };

        String message = "Important: System maintenance scheduled for tonight at 11 PM EST.";

        for (String email : emailAddresses) {
            NotificationFactory factory = new EmailNotificationFactory(email);
            System.out.println("Sending to: " + email);
            factory.notifyUser(message);
        }
    }

    /**
     * Demonstrates error handling with invalid data
     */
    private static void demonstrateErrorHandling() {
        try {
            // Invalid phone number
            System.out.println("Attempting to send SMS to invalid number...");
            Notification invalidSMS = new SMSNotification("invalid-phone");
            if (!invalidSMS.validate()) {
                System.out.println("Validation failed: Invalid phone number format");
            } else {
                invalidSMS.send("This should not send");
            }
        } catch (Exception e) {
            System.out.println("Caught exception: " + e.getMessage());
        }

        try {
            // Invalid email
            System.out.println("\nAttempting to send email to invalid address...");
            Notification invalidEmail = new EmailNotification("not-an-email");
            if (!invalidEmail.validate()) {
                System.out.println("Validation failed: Invalid email format");
            } else {
                invalidEmail.send("This should not send");
            }
        } catch (Exception e) {
            System.out.println("Caught exception: " + e.getMessage());
        }
    }

    /**
     * Helper method to demonstrate runtime factory selection
     *
     * @param type the type of notification to create
     * @param recipient the recipient identifier
     * @return the appropriate notification factory
     */
    private static NotificationFactory getNotificationFactory(String type, String recipient) {
        switch (type.toUpperCase()) {
            case "EMAIL":
                return new EmailNotificationFactory(recipient);
            case "SMS":
                return new SMSNotificationFactory(recipient);
            case "PUSH":
                return new PushNotificationFactory(recipient);
            default:
                System.out.println("Unknown type, defaulting to EMAIL");
                return new EmailNotificationFactory(recipient);
        }
    }
}
