package Integration.MessageSequence;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.time.Instant;

/**
 * Represents a message in the integration system.
 * Contains headers, payload, and metadata.
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
     * Gets the message ID.
     *
     * @return The message ID
     */
    public String getMessageId() {
        return messageId;
    }

    /**
     * Gets the timestamp.
     *
     * @return The timestamp
     */
    public Instant getTimestamp() {
        return timestamp;
    }

    /**
     * Gets all headers.
     *
     * @return Map of headers
     */
    public Map<String, Object> getHeaders() {
        return new HashMap<>(headers);
    }

    /**
     * Gets a specific header.
     *
     * @param key The header key
     * @return The header value
     */
    public Object getHeader(String key) {
        return headers.get(key);
    }

    /**
     * Sets a header.
     *
     * @param key The header key
     * @param value The header value
     */
    public void setHeader(String key, Object value) {
        headers.put(key, value);
    }

    /**
     * Gets the payload.
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
