package Integration.ComposedMessageProcessor;

import java.util.*;
import java.time.Instant;

/**
 * Represents a message in the integration system.
 *
 * Messages contain:
 * - Unique message ID
 * - Timestamp
 * - Headers (metadata)
 * - Payload (business data)
 */
public class Message {

    private final String messageId;
    private final Instant timestamp;
    private final Map<String, Object> headers;
    private final Object payload;

    /**
     * Constructs a Message with the specified payload.
     *
     * @param payload The message payload
     */
    public Message(Object payload) {
        this.messageId = UUID.randomUUID().toString();
        this.timestamp = Instant.now();
        this.headers = new HashMap<>();
        this.payload = payload;
    }

    /**
     * Constructs a Message with payload and headers.
     *
     * @param payload The message payload
     * @param headers Initial headers
     */
    public Message(Object payload, Map<String, Object> headers) {
        this.messageId = UUID.randomUUID().toString();
        this.timestamp = Instant.now();
        this.headers = new HashMap<>(headers);
        this.payload = payload;
    }

    /**
     * Gets the message ID.
     *
     * @return The unique message identifier
     */
    public String getMessageId() {
        return messageId;
    }

    /**
     * Gets the timestamp when the message was created.
     *
     * @return The message timestamp
     */
    public Instant getTimestamp() {
        return timestamp;
    }

    /**
     * Gets all message headers.
     *
     * @return Map of all headers
     */
    public Map<String, Object> getHeaders() {
        return new HashMap<>(headers);
    }

    /**
     * Gets a specific header value.
     *
     * @param key The header key
     * @return The header value, or null if not found
     */
    public Object getHeader(String key) {
        return headers.get(key);
    }

    /**
     * Sets a header value.
     *
     * @param key The header key
     * @param value The header value
     */
    public void setHeader(String key, Object value) {
        headers.put(key, value);
    }

    /**
     * Removes a header.
     *
     * @param key The header key to remove
     */
    public void removeHeader(String key) {
        headers.remove(key);
    }

    /**
     * Checks if a header exists.
     *
     * @param key The header key
     * @return true if the header exists
     */
    public boolean hasHeader(String key) {
        return headers.containsKey(key);
    }

    /**
     * Gets the message payload.
     *
     * @return The message payload
     */
    public Object getPayload() {
        return payload;
    }

    /**
     * Gets the payload as a specific type.
     *
     * @param <T> The target type
     * @param type The class of the target type
     * @return The payload cast to the specified type
     * @throws ClassCastException if the payload cannot be cast
     */
    @SuppressWarnings("unchecked")
    public <T> T getPayloadAs(Class<T> type) {
        return (T) payload;
    }

    @Override
    public String toString() {
        return String.format("Message[id=%s, timestamp=%s, payload=%s, headers=%d]",
            messageId, timestamp, payload, headers.size());
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Message message = (Message) o;
        return Objects.equals(messageId, message.messageId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(messageId);
    }
}
