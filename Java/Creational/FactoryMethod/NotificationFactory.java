/**
 * Creator/Factory class - defines the factory method
 *
 * This abstract class declares the factory method that returns a Notification object.
 * Subclasses override this method to create different types of notifications.
 */
public abstract class NotificationFactory {

    /**
     * Factory method - subclasses override to create specific notification types
     *
     * @return a Notification instance
     */
    public abstract Notification createNotification();

    /**
     * Template method that uses the factory method
     * This demonstrates how the factory method is used in a larger operation
     *
     * @param message the message to send
     */
    public void notifyUser(String message) {
        Notification notification = createNotification();
        System.out.println("Created notification of type: " + notification.getType());
        notification.send(message);
    }
}
