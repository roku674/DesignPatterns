package Cloud.ClaimCheck;

import java.util.*;
import java.util.concurrent.*;
import java.time.Instant;
import java.time.Duration;
import java.util.zip.*;
import java.io.*;

/**
 * ClaimCheck Pattern Demonstration
 *
 * The Claim Check pattern splits a large message into a claim check and a payload.
 * It stores the payload in external storage and sends only the claim check through
 * the messaging infrastructure, reducing message size and improving throughput.
 *
 * Key Components:
 * - Claim Check: Small reference token to retrieve payload
 * - Payload Store: External storage for large message data
 * - Message Bus: Transports claim checks
 * - Claim Processor: Retrieves payload using claim check
 *
 * Cloud Resilience Features:
 * - Automatic payload compression
 * - Payload encryption for security
 * - TTL-based payload expiration
 * - Async payload storage and retrieval
 * - Payload versioning
 * - Storage redundancy
 */
public class Main {
    public static void main(String[] args) throws Exception {
        System.out.println("=== ClaimCheck Pattern Demo ===\n");

        // Scenario 1: Basic claim check pattern
        demonstrateBasicClaimCheck();

        // Scenario 2: Large payload handling
        demonstrateLargePayload();

        // Scenario 3: Payload compression
        demonstrateCompression();

        // Scenario 4: Async payload storage
        demonstrateAsyncStorage();

        // Scenario 5: Payload TTL and expiration
        demonstratePayloadExpiration();

        // Scenario 6: Multiple payload formats
        demonstrateMultipleFormats();

        // Scenario 7: Payload encryption
        demonstrateEncryption();

        // Scenario 8: Claim check with metadata
        demonstrateMetadata();

        // Scenario 9: Batch claim check processing
        demonstrateBatchProcessing();

        // Scenario 10: Storage resilience and recovery
        demonstrateStorageResilience();

        System.out.println("\nPattern demonstration complete.");
    }

    /**
     * Scenario 1: Basic claim check pattern
     * Demonstrates fundamental claim check operation
     */
    private static void demonstrateBasicClaimCheck() {
        System.out.println("--- Scenario 1: Basic Claim Check Pattern ---");

        PayloadStore payloadStore = new PayloadStore();
        MessageBus messageBus = new MessageBus();
        ClaimCheckService claimCheckService = new ClaimCheckService(payloadStore, messageBus);

        // Send message with payload
        String payload = "Large order data with customer details and product information";
        String claimCheck = claimCheckService.storeAndSend(payload, "order.created");

        System.out.println("Claim check sent: " + claimCheck);

        // Retrieve payload using claim check
        String retrieved = claimCheckService.retrievePayload(claimCheck);
        System.out.println("Retrieved payload: " + retrieved);

        System.out.println();
    }

    /**
     * Scenario 2: Handling large payloads
     * Demonstrates efficiency with large data
     */
    private static void demonstrateLargePayload() {
        System.out.println("--- Scenario 2: Large Payload Handling ---");

        PayloadStore payloadStore = new PayloadStore();
        MessageBus messageBus = new MessageBus();
        ClaimCheckService claimCheckService = new ClaimCheckService(payloadStore, messageBus);

        // Create large payload
        StringBuilder largePayload = new StringBuilder();
        for (int i = 0; i < 1000; i++) {
            largePayload.append("Order line item ").append(i).append(": Product data, pricing, inventory...\n");
        }

        System.out.println("Original payload size: " + largePayload.length() + " bytes");

        String claimCheck = claimCheckService.storeAndSend(largePayload.toString(), "bulk.order");
        System.out.println("Claim check size: " + claimCheck.length() + " bytes");

        System.out.println("Size reduction: " +
            String.format("%.2f%%", (1.0 - (double) claimCheck.length() / largePayload.length()) * 100));

        System.out.println();
    }

    /**
     * Scenario 3: Payload compression
     * Demonstrates automatic payload compression
     */
    private static void demonstrateCompression() {
        System.out.println("--- Scenario 3: Payload Compression ---");

        PayloadStore payloadStore = new PayloadStore();
        payloadStore.enableCompression(true);
        MessageBus messageBus = new MessageBus();
        ClaimCheckService claimCheckService = new ClaimCheckService(payloadStore, messageBus);

        String payload = "This is highly compressible data. ".repeat(100);
        System.out.println("Original payload size: " + payload.length() + " bytes");

        String claimCheck = claimCheckService.storeAndSend(payload, "compressed.data");

        // Retrieve and verify
        String retrieved = claimCheckService.retrievePayload(claimCheck);
        System.out.println("Retrieved successfully: " + (payload.equals(retrieved)));

        System.out.println();
    }

    /**
     * Scenario 4: Asynchronous payload storage
     * Demonstrates non-blocking payload operations
     */
    private static void demonstrateAsyncStorage() throws Exception {
        System.out.println("--- Scenario 4: Async Payload Storage ---");

        PayloadStore payloadStore = new PayloadStore();
        MessageBus messageBus = new MessageBus();
        ClaimCheckService claimCheckService = new ClaimCheckService(payloadStore, messageBus);

        // Store payload asynchronously
        String payload = "Async payload data for order processing";
        CompletableFuture<String> futureClaimCheck =
            claimCheckService.storeAndSendAsync(payload, "async.order");

        System.out.println("Payload storage initiated...");

        String claimCheck = futureClaimCheck.get();
        System.out.println("Claim check ready: " + claimCheck);

        // Async retrieval
        CompletableFuture<String> futurePayload =
            claimCheckService.retrievePayloadAsync(claimCheck);

        System.out.println("Payload retrieval initiated...");
        String retrieved = futurePayload.get();
        System.out.println("Payload retrieved: " + retrieved.substring(0, 30) + "...");

        System.out.println();
    }

    /**
     * Scenario 5: Payload TTL and expiration
     * Demonstrates automatic payload cleanup
     */
    private static void demonstratePayloadExpiration() throws Exception {
        System.out.println("--- Scenario 5: Payload TTL and Expiration ---");

        PayloadStore payloadStore = new PayloadStore();
        payloadStore.setDefaultTTL(Duration.ofSeconds(2));
        MessageBus messageBus = new MessageBus();
        ClaimCheckService claimCheckService = new ClaimCheckService(payloadStore, messageBus);

        String payload = "Temporary payload with expiration";
        String claimCheck = claimCheckService.storeAndSend(payload, "temp.data");

        // Retrieve within TTL
        System.out.println("Immediate retrieval: " + claimCheckService.retrievePayload(claimCheck));

        // Wait for expiration
        Thread.sleep(2500);

        // Try to retrieve after expiration
        try {
            claimCheckService.retrievePayload(claimCheck);
        } catch (RuntimeException e) {
            System.out.println("Expected expiration: " + e.getMessage());
        }

        System.out.println();
    }

    /**
     * Scenario 6: Multiple payload formats
     * Demonstrates handling different data types
     */
    private static void demonstrateMultipleFormats() {
        System.out.println("--- Scenario 6: Multiple Payload Formats ---");

        PayloadStore payloadStore = new PayloadStore();
        MessageBus messageBus = new MessageBus();
        ClaimCheckService claimCheckService = new ClaimCheckService(payloadStore, messageBus);

        // JSON payload
        String jsonPayload = "{\"orderId\": \"123\", \"customer\": \"John Doe\", \"items\": [1,2,3]}";
        String jsonClaimCheck = claimCheckService.storeAndSend(jsonPayload, "order.json", "application/json");
        System.out.println("Stored JSON payload: " + jsonClaimCheck);

        // XML payload
        String xmlPayload = "<order><id>123</id><customer>John Doe</customer></order>";
        String xmlClaimCheck = claimCheckService.storeAndSend(xmlPayload, "order.xml", "application/xml");
        System.out.println("Stored XML payload: " + xmlClaimCheck);

        // Binary payload
        byte[] binaryPayload = new byte[]{1, 2, 3, 4, 5};
        String binaryClaimCheck = claimCheckService.storeAndSend(
            Base64.getEncoder().encodeToString(binaryPayload), "data.bin", "application/octet-stream");
        System.out.println("Stored binary payload: " + binaryClaimCheck);

        System.out.println();
    }

    /**
     * Scenario 7: Payload encryption
     * Demonstrates security for sensitive data
     */
    private static void demonstrateEncryption() {
        System.out.println("--- Scenario 7: Payload Encryption ---");

        PayloadStore payloadStore = new PayloadStore();
        payloadStore.enableEncryption(true);
        MessageBus messageBus = new MessageBus();
        ClaimCheckService claimCheckService = new ClaimCheckService(payloadStore, messageBus);

        String sensitivePayload = "SSN: 123-45-6789, Credit Card: 4111-1111-1111-1111";
        System.out.println("Original sensitive data: " + sensitivePayload);

        String claimCheck = claimCheckService.storeAndSend(sensitivePayload, "sensitive.data");
        System.out.println("Stored encrypted payload: " + claimCheck);

        String retrieved = claimCheckService.retrievePayload(claimCheck);
        System.out.println("Decrypted payload matches: " + sensitivePayload.equals(retrieved));

        System.out.println();
    }

    /**
     * Scenario 8: Claim check with metadata
     * Demonstrates enriched claim checks with metadata
     */
    private static void demonstrateMetadata() {
        System.out.println("--- Scenario 8: Claim Check with Metadata ---");

        PayloadStore payloadStore = new PayloadStore();
        MessageBus messageBus = new MessageBus();
        ClaimCheckService claimCheckService = new ClaimCheckService(payloadStore, messageBus);

        String payload = "Order data for premium customer";
        Map<String, String> metadata = new HashMap<>();
        metadata.put("priority", "HIGH");
        metadata.put("customerId", "CUST-12345");
        metadata.put("region", "US-WEST");

        EnrichedClaimCheck enrichedCheck = claimCheckService.storeWithMetadata(payload, "order.priority", metadata);
        System.out.println("Claim check ID: " + enrichedCheck.getClaimCheckId());
        System.out.println("Metadata: " + enrichedCheck.getMetadata());

        System.out.println();
    }

    /**
     * Scenario 9: Batch claim check processing
     * Demonstrates efficient batch operations
     */
    private static void demonstrateBatchProcessing() throws Exception {
        System.out.println("--- Scenario 9: Batch Claim Check Processing ---");

        PayloadStore payloadStore = new PayloadStore();
        MessageBus messageBus = new MessageBus();
        ClaimCheckService claimCheckService = new ClaimCheckService(payloadStore, messageBus);

        // Create batch of payloads
        List<String> payloads = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            payloads.add("Batch payload " + i + " with order data");
        }

        // Store batch
        List<String> claimChecks = claimCheckService.storeBatch(payloads, "batch.orders");
        System.out.println("Stored " + claimChecks.size() + " payloads in batch");

        // Retrieve batch
        List<String> retrieved = claimCheckService.retrieveBatch(claimChecks);
        System.out.println("Retrieved " + retrieved.size() + " payloads in batch");

        System.out.println();
    }

    /**
     * Scenario 10: Storage resilience and recovery
     * Demonstrates fault tolerance and recovery
     */
    private static void demonstrateStorageResilience() {
        System.out.println("--- Scenario 10: Storage Resilience and Recovery ---");

        PayloadStore primaryStore = new PayloadStore();
        PayloadStore backupStore = new PayloadStore();

        ResilientPayloadStore resilientStore = new ResilientPayloadStore(primaryStore, backupStore);
        MessageBus messageBus = new MessageBus();
        ClaimCheckService claimCheckService = new ClaimCheckService(resilientStore, messageBus);

        String payload = "Critical order data that must not be lost";
        String claimCheck = claimCheckService.storeAndSend(payload, "critical.order");

        System.out.println("Payload stored with redundancy");

        // Simulate primary storage failure
        primaryStore.simulateFailure(true);
        System.out.println("Primary storage failed");

        // Retrieve from backup
        String retrieved = claimCheckService.retrievePayload(claimCheck);
        System.out.println("Retrieved from backup: " + retrieved);

        System.out.println();
    }
}

/**
 * Payload store for storing large message payloads
 */
class PayloadStore {
    private Map<String, StoredPayload> storage = new ConcurrentHashMap<>();
    private boolean compressionEnabled = false;
    private boolean encryptionEnabled = false;
    private Duration defaultTTL = Duration.ofHours(24);
    private boolean failureMode = false;

    public String store(String payload, String contentType) {
        if (failureMode) {
            throw new RuntimeException("Storage unavailable");
        }

        String claimCheckId = UUID.randomUUID().toString();
        Instant expiryTime = Instant.now().plus(defaultTTL);

        byte[] data = payload.getBytes();

        // Compress if enabled
        if (compressionEnabled) {
            data = compress(data);
            System.out.println("  [STORAGE] Compressed payload: " + payload.length() + " -> " + data.length + " bytes");
        }

        // Encrypt if enabled
        if (encryptionEnabled) {
            data = encrypt(data);
            System.out.println("  [STORAGE] Encrypted payload");
        }

        StoredPayload storedPayload = new StoredPayload(data, contentType, expiryTime, compressionEnabled, encryptionEnabled);
        storage.put(claimCheckId, storedPayload);

        System.out.println("  [STORAGE] Stored payload: " + claimCheckId);
        return claimCheckId;
    }

    public String retrieve(String claimCheckId) {
        if (failureMode) {
            throw new RuntimeException("Storage unavailable");
        }

        StoredPayload storedPayload = storage.get(claimCheckId);
        if (storedPayload == null) {
            throw new RuntimeException("Payload not found: " + claimCheckId);
        }

        if (storedPayload.isExpired()) {
            storage.remove(claimCheckId);
            throw new RuntimeException("Payload expired: " + claimCheckId);
        }

        byte[] data = storedPayload.getData();

        // Decrypt if needed
        if (storedPayload.isEncrypted()) {
            data = decrypt(data);
        }

        // Decompress if needed
        if (storedPayload.isCompressed()) {
            data = decompress(data);
        }

        System.out.println("  [STORAGE] Retrieved payload: " + claimCheckId);
        return new String(data);
    }

    public void enableCompression(boolean enabled) {
        this.compressionEnabled = enabled;
    }

    public void enableEncryption(boolean enabled) {
        this.encryptionEnabled = enabled;
    }

    public void setDefaultTTL(Duration ttl) {
        this.defaultTTL = ttl;
    }

    public void simulateFailure(boolean fail) {
        this.failureMode = fail;
    }

    private byte[] compress(byte[] data) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (GZIPOutputStream gzipOut = new GZIPOutputStream(baos)) {
            gzipOut.write(data);
        } catch (IOException e) {
            throw new RuntimeException("Compression failed", e);
        }
        return baos.toByteArray();
    }

    private byte[] decompress(byte[] data) {
        ByteArrayInputStream bais = new ByteArrayInputStream(data);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (GZIPInputStream gzipIn = new GZIPInputStream(bais)) {
            byte[] buffer = new byte[1024];
            int len;
            while ((len = gzipIn.read(buffer)) > 0) {
                baos.write(buffer, 0, len);
            }
        } catch (IOException e) {
            throw new RuntimeException("Decompression failed", e);
        }
        return baos.toByteArray();
    }

    private byte[] encrypt(byte[] data) {
        // Simple XOR encryption for demo purposes
        byte[] key = "SECRET_KEY_12345".getBytes();
        byte[] encrypted = new byte[data.length];
        for (int i = 0; i < data.length; i++) {
            encrypted[i] = (byte) (data[i] ^ key[i % key.length]);
        }
        return encrypted;
    }

    private byte[] decrypt(byte[] data) {
        // XOR decryption (same as encryption)
        return encrypt(data);
    }
}

/**
 * Stored payload with metadata
 */
class StoredPayload {
    private byte[] data;
    private String contentType;
    private Instant expiryTime;
    private boolean compressed;
    private boolean encrypted;

    public StoredPayload(byte[] data, String contentType, Instant expiryTime, boolean compressed, boolean encrypted) {
        this.data = data;
        this.contentType = contentType;
        this.expiryTime = expiryTime;
        this.compressed = compressed;
        this.encrypted = encrypted;
    }

    public byte[] getData() { return data; }
    public String getContentType() { return contentType; }
    public boolean isExpired() { return Instant.now().isAfter(expiryTime); }
    public boolean isCompressed() { return compressed; }
    public boolean isEncrypted() { return encrypted; }
}

/**
 * Resilient payload store with backup
 */
class ResilientPayloadStore extends PayloadStore {
    private PayloadStore primaryStore;
    private PayloadStore backupStore;

    public ResilientPayloadStore(PayloadStore primaryStore, PayloadStore backupStore) {
        this.primaryStore = primaryStore;
        this.backupStore = backupStore;
    }

    @Override
    public String store(String payload, String contentType) {
        String claimCheckId = primaryStore.store(payload, contentType);
        // Store backup
        backupStore.store(payload, contentType);
        System.out.println("  [RESILIENT] Stored to both primary and backup");
        return claimCheckId;
    }

    @Override
    public String retrieve(String claimCheckId) {
        try {
            return primaryStore.retrieve(claimCheckId);
        } catch (Exception e) {
            System.out.println("  [RESILIENT] Primary failed, using backup");
            return backupStore.retrieve(claimCheckId);
        }
    }
}

/**
 * Message bus for transporting claim checks
 */
class MessageBus {
    private List<ClaimCheckMessage> messages = new CopyOnWriteArrayList<>();

    public void send(ClaimCheckMessage message) {
        messages.add(message);
        System.out.println("  [BUS] Sent claim check: " + message.getClaimCheckId().substring(0, 8));
    }

    public ClaimCheckMessage receive() {
        if (messages.isEmpty()) {
            return null;
        }
        return messages.remove(0);
    }
}

/**
 * Claim check message
 */
class ClaimCheckMessage {
    private String claimCheckId;
    private String eventType;
    private Instant timestamp;

    public ClaimCheckMessage(String claimCheckId, String eventType) {
        this.claimCheckId = claimCheckId;
        this.eventType = eventType;
        this.timestamp = Instant.now();
    }

    public String getClaimCheckId() { return claimCheckId; }
    public String getEventType() { return eventType; }
    public Instant getTimestamp() { return timestamp; }
}

/**
 * Enriched claim check with metadata
 */
class EnrichedClaimCheck {
    private String claimCheckId;
    private String eventType;
    private Map<String, String> metadata;
    private Instant timestamp;

    public EnrichedClaimCheck(String claimCheckId, String eventType, Map<String, String> metadata) {
        this.claimCheckId = claimCheckId;
        this.eventType = eventType;
        this.metadata = new HashMap<>(metadata);
        this.timestamp = Instant.now();
    }

    public String getClaimCheckId() { return claimCheckId; }
    public String getEventType() { return eventType; }
    public Map<String, String> getMetadata() { return metadata; }
    public Instant getTimestamp() { return timestamp; }
}

/**
 * Claim check service orchestrating the pattern
 */
class ClaimCheckService {
    private PayloadStore payloadStore;
    private MessageBus messageBus;
    private ExecutorService executor = Executors.newFixedThreadPool(5);

    public ClaimCheckService(PayloadStore payloadStore, MessageBus messageBus) {
        this.payloadStore = payloadStore;
        this.messageBus = messageBus;
    }

    /**
     * Store payload and send claim check
     */
    public String storeAndSend(String payload, String eventType) {
        return storeAndSend(payload, eventType, "text/plain");
    }

    public String storeAndSend(String payload, String eventType, String contentType) {
        String claimCheckId = payloadStore.store(payload, contentType);
        ClaimCheckMessage message = new ClaimCheckMessage(claimCheckId, eventType);
        messageBus.send(message);
        return claimCheckId;
    }

    /**
     * Async store and send
     */
    public CompletableFuture<String> storeAndSendAsync(String payload, String eventType) {
        return CompletableFuture.supplyAsync(() -> storeAndSend(payload, eventType), executor);
    }

    /**
     * Retrieve payload using claim check
     */
    public String retrievePayload(String claimCheckId) {
        return payloadStore.retrieve(claimCheckId);
    }

    /**
     * Async retrieve
     */
    public CompletableFuture<String> retrievePayloadAsync(String claimCheckId) {
        return CompletableFuture.supplyAsync(() -> retrievePayload(claimCheckId), executor);
    }

    /**
     * Store with metadata
     */
    public EnrichedClaimCheck storeWithMetadata(String payload, String eventType, Map<String, String> metadata) {
        String claimCheckId = payloadStore.store(payload, "text/plain");
        return new EnrichedClaimCheck(claimCheckId, eventType, metadata);
    }

    /**
     * Batch operations
     */
    public List<String> storeBatch(List<String> payloads, String eventType) {
        List<String> claimChecks = new ArrayList<>();
        for (String payload : payloads) {
            String claimCheckId = payloadStore.store(payload, "text/plain");
            claimChecks.add(claimCheckId);
        }
        System.out.println("  [BATCH] Stored " + claimChecks.size() + " payloads");
        return claimChecks;
    }

    public List<String> retrieveBatch(List<String> claimChecks) {
        List<String> payloads = new ArrayList<>();
        for (String claimCheckId : claimChecks) {
            payloads.add(payloadStore.retrieve(claimCheckId));
        }
        System.out.println("  [BATCH] Retrieved " + payloads.size() + " payloads");
        return payloads;
    }

    public void shutdown() {
        executor.shutdown();
    }
}
