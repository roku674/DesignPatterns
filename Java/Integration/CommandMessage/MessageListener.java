package Integration.CommandMessage;

/**
 * MessageListener interface for receiving notifications when messages arrive.
 */
public interface MessageListener {
    /**
     * Called when a message arrives on the channel.
     *
     * @param message The received message
     */
    void onMessage(Message message);
}
