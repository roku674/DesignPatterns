/**
 * Product interface - defines the interface for objects the factory method creates
 */
public interface Notification {

    /**
     * Sends the notification with the given message
     *
     * @param message the message to send
     */
    void send(String message);

    /**
     * Gets the notification type
     *
     * @return the type of notification
     */
    String getType();
}
