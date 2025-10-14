package Integration.CommandMessage;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

/**
 * MessageChannel provides a communication pathway for messages.
 * This is a simple in-memory implementation for demonstration purposes.
 */
public class MessageChannel {
    private final String channelName;
    private final BlockingQueue<Message> queue;
    private final List<MessageListener> listeners;

    /**
     * Constructs a MessageChannel with the specified name.
     *
     * @param channelName The name of this channel
     */
    public MessageChannel(String channelName) {
        this.channelName = channelName;
        this.queue = new LinkedBlockingQueue<>();
        this.listeners = new ArrayList<>();
    }

    /**
     * Sends a message to this channel.
     *
     * @param message The message to send
     */
    public void send(Message message) {
        try {
            queue.put(message);
            System.out.println("Message sent to channel: " + channelName);
            notifyListeners(message);
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
        Message message = queue.take();
        System.out.println("Message received from channel: " + channelName);
        return message;
    }

    /**
     * Polls for a message (non-blocking).
     *
     * @return The message, or null if no message is available
     */
    public Message poll() {
        Message message = queue.poll();
        if (message != null) {
            System.out.println("Message polled from channel: " + channelName);
        }
        return message;
    }

    /**
     * Registers a listener to be notified when messages arrive.
     *
     * @param listener The message listener
     */
    public void addListener(MessageListener listener) {
        listeners.add(listener);
    }

    /**
     * Notifies all listeners about a new message.
     *
     * @param message The message that arrived
     */
    private void notifyListeners(Message message) {
        for (MessageListener listener : listeners) {
            listener.onMessage(message);
        }
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
