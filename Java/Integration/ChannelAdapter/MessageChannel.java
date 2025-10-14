package Integration.ChannelAdapter;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

/**
 * MessageChannel provides a communication pathway for messages between adapters.
 * This is a simple in-memory implementation for demonstration purposes.
 */
public class MessageChannel {
    private final String channelName;
    private final BlockingQueue<Message> queue;

    /**
     * Constructs a MessageChannel with the specified name.
     *
     * @param channelName The name of this channel
     */
    public MessageChannel(String channelName) {
        this.channelName = channelName;
        this.queue = new LinkedBlockingQueue<>();
    }

    /**
     * Sends a message to this channel.
     *
     * @param message The message to send
     */
    public void send(Message message) {
        try {
            queue.put(message);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.out.println("Failed to send message: " + e.getMessage());
        }
    }

    /**
     * Receives a message from this channel (blocking).
     *
     * @return The received message
     * @throws InterruptedException if interrupted while waiting
     */
    public Message receive() throws InterruptedException {
        return queue.take();
    }

    /**
     * Polls for a message (non-blocking).
     *
     * @return The message, or null if no message is available
     */
    public Message poll() {
        return queue.poll();
    }

    /**
     * Gets the channel name.
     *
     * @return The channel name
     */
    public String getChannelName() {
        return channelName;
    }

    /**
     * Gets the current number of messages in the channel.
     *
     * @return The message count
     */
    public int getMessageCount() {
        return queue.size();
    }
}
