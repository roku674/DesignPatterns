import javax.mail.MessagingException;

/**
 * Product interface - defines the interface for objects the factory method creates
 */
public interface Notification {

    /**
     * Sends the notification with the given message
     *
     * @param message the message to send
     * @throws MessagingException if sending fails
     */
    void send(String message) throws MessagingException;

    /**
     * Sends the notification with subject and message
     *
     * @param subject the subject/title
     * @param message the message content
     * @throws MessagingException if sending fails
     */
    void send(String subject, String message) throws MessagingException;

    /**
     * Gets the notification type
     *
     * @return the type of notification
     */
    String getType();

    /**
     * Validates the recipient information
     *
     * @return true if valid, false otherwise
     */
    boolean validate();

    /**
     * Gets the recipient identifier
     *
     * @return recipient email, phone number, or device ID
     */
    String getRecipient();
}
