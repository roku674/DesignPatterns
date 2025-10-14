package Integration.CommandMessage;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.time.Instant;

/**
 * Base Message class for integration messaging.
 * Provides common message attributes like messageId, timestamp, and headers.
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
     * Constructs a Message with payload and custom headers.
     *
     * @param payload The message payload
     * @param headers Custom headers for the message
     */
    public Message(Object payload, Map<String, Object> headers) {
        this.messageId = UUID.randomUUID().toString();
        this.timestamp = Instant.now();
        this.headers = new HashMap<>(headers);
        this.payload = payload;
    }

    /**
     * Gets the unique message identifier.
     *
     * @return The message ID
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
     * Gets the message headers.
     *
     * @return Map of message headers
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
     * Gets the message payload.
     *
     * @return The message payload
     */
    public Object getPayload() {
        return payload;
    }

    @Override
    public String toString() {
        return String.format("Message[id=%s, timestamp=%s, headers=%s, payload=%s]",
            messageId, timestamp, headers, payload);
    }
}
