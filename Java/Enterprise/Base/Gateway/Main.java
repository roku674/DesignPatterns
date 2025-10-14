package Enterprise.Base.Gateway;

import java.util.*;
import java.util.concurrent.*;

/**
 * Gateway Pattern Implementation
 *
 * Purpose:
 * An object that encapsulates access to an external system or resource.
 * The Gateway acts as a simple API facade to a more complex underlying system,
 * providing a cleaner interface for the application.
 *
 * Types of Gateways:
 * - Row Data Gateway: One instance per row
 * - Table Data Gateway: One instance per table
 * - Remote Gateway: Access to remote services
 * - Message Gateway: Access to messaging systems
 *
 * Benefits:
 * - Simplifies access to external resources
 * - Centralizes external communication logic
 * - Easier to mock for testing
 * - Provides clear integration points
 *
 * This implementation demonstrates:
 * 1. Database Table Data Gateway
 * 2. Row Data Gateway pattern
 * 3. REST API Gateway
 * 4. File System Gateway
 * 5. Cache Gateway (Redis-like)
 * 6. Email Gateway
 * 7. Payment Gateway
 * 8. Message Queue Gateway
 * 9. Cloud Storage Gateway
 * 10. Third-Party Service Gateway
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("=== Gateway Pattern Demo ===\n");

        // Scenario 1: Database Table Data Gateway
        demonstrateTableDataGateway();

        // Scenario 2: Row Data Gateway
        demonstrateRowDataGateway();

        // Scenario 3: REST API Gateway
        demonstrateRESTAPIGateway();

        // Scenario 4: File System Gateway
        demonstrateFileSystemGateway();

        // Scenario 5: Cache Gateway
        demonstrateCacheGateway();

        // Scenario 6: Email Gateway
        demonstrateEmailGateway();

        // Scenario 7: Payment Gateway
        demonstratePaymentGateway();

        // Scenario 8: Message Queue Gateway
        demonstrateMessageQueueGateway();

        // Scenario 9: Cloud Storage Gateway
        demonstrateCloudStorageGateway();

        // Scenario 10: Third-Party Service Gateway
        demonstrateThirdPartyGateway();
    }

    /**
     * Scenario 1: Database Table Data Gateway
     */
    private static void demonstrateTableDataGateway() {
        System.out.println("\n--- Scenario 1: Database Table Data Gateway ---");

        UserTableGateway userGateway = new UserTableGateway();

        // Insert users
        userGateway.insert("john@example.com", "John Doe", "admin");
        userGateway.insert("jane@example.com", "Jane Smith", "user");

        // Find users
        System.out.println("\nFinding user by email:");
        Map<String, Object> user = userGateway.findByEmail("john@example.com");
        System.out.println("Found: " + user);

        // Update user
        userGateway.update("john@example.com", "John D. Doe", "superadmin");

        // Get all users
        System.out.println("\nAll users:");
        List<Map<String, Object>> allUsers = userGateway.findAll();
        for (Map<String, Object> u : allUsers) {
            System.out.println(u);
        }

        // Delete user
        userGateway.delete("jane@example.com");
        System.out.println("\nAfter deletion, total users: " + userGateway.count());
    }

    /**
     * Scenario 2: Row Data Gateway
     */
    private static void demonstrateRowDataGateway() {
        System.out.println("\n--- Scenario 2: Row Data Gateway ---");

        // Create product rows
        ProductRow laptop = new ProductRow(null, "Laptop", "Electronics", 999.99, 15);
        laptop.insert();

        ProductRow mouse = new ProductRow(null, "Mouse", "Accessories", 29.99, 50);
        mouse.insert();

        System.out.println("Created products:");
        System.out.println("Laptop ID: " + laptop.getId());
        System.out.println("Mouse ID: " + mouse.getId());

        // Load existing product
        ProductRow loadedProduct = ProductRow.load(laptop.getId());
        System.out.println("\nLoaded product: " + loadedProduct.getName() +
            " - $" + loadedProduct.getPrice());

        // Update product
        loadedProduct.setPrice(949.99);
        loadedProduct.setStock(20);
        loadedProduct.update();
        System.out.println("Updated price to: $" + loadedProduct.getPrice());

        // Delete product
        mouse.delete();
        System.out.println("Deleted mouse product");
    }

    /**
     * Scenario 3: REST API Gateway
     */
    private static void demonstrateRESTAPIGateway() {
        System.out.println("\n--- Scenario 3: REST API Gateway ---");

        RESTAPIGateway apiGateway = new RESTAPIGateway("https://api.example.com");

        // GET request
        System.out.println("GET /users");
        String users = apiGateway.get("/users");
        System.out.println("Response: " + users);

        // POST request
        System.out.println("\nPOST /users");
        Map<String, Object> userData = new HashMap<>();
        userData.put("name", "John Doe");
        userData.put("email", "john@example.com");
        String createResponse = apiGateway.post("/users", userData);
        System.out.println("Response: " + createResponse);

        // PUT request
        System.out.println("\nPUT /users/123");
        Map<String, Object> updateData = new HashMap<>();
        updateData.put("name", "John D. Doe");
        String updateResponse = apiGateway.put("/users/123", updateData);
        System.out.println("Response: " + updateResponse);

        // DELETE request
        System.out.println("\nDELETE /users/123");
        String deleteResponse = apiGateway.delete("/users/123");
        System.out.println("Response: " + deleteResponse);
    }

    /**
     * Scenario 4: File System Gateway
     */
    private static void demonstrateFileSystemGateway() {
        System.out.println("\n--- Scenario 4: File System Gateway ---");

        FileSystemGateway fsGateway = new FileSystemGateway("/tmp/app");

        // Write file
        fsGateway.writeFile("config.txt", "app.name=MyApp\napp.version=1.0");
        System.out.println("Written config.txt");

        // Read file
        String content = fsGateway.readFile("config.txt");
        System.out.println("Read content:\n" + content);

        // List files
        System.out.println("\nFiles in directory:");
        List<String> files = fsGateway.listFiles();
        for (String file : files) {
            System.out.println("- " + file);
        }

        // Check existence
        System.out.println("\nconfig.txt exists: " + fsGateway.exists("config.txt"));
        System.out.println("nonexistent.txt exists: " + fsGateway.exists("nonexistent.txt"));

        // Delete file
        fsGateway.deleteFile("config.txt");
        System.out.println("\nDeleted config.txt");
    }

    /**
     * Scenario 5: Cache Gateway
     */
    private static void demonstrateCacheGateway() {
        System.out.println("\n--- Scenario 5: Cache Gateway ---");

        CacheGateway cache = new CacheGateway();

        // Set values
        cache.set("user:1", "John Doe");
        cache.set("user:2", "Jane Smith");
        cache.set("session:abc123", "active", 3600); // 1 hour expiry

        // Get values
        System.out.println("user:1 = " + cache.get("user:1"));
        System.out.println("user:2 = " + cache.get("user:2"));

        // Check existence
        System.out.println("\nuser:1 exists: " + cache.exists("user:1"));
        System.out.println("user:3 exists: " + cache.exists("user:3"));

        // Increment counter
        cache.increment("page_views");
        cache.increment("page_views");
        cache.increment("page_views");
        System.out.println("\nPage views: " + cache.get("page_views"));

        // Delete key
        cache.delete("user:2");
        System.out.println("Deleted user:2, exists: " + cache.exists("user:2"));

        // Get all keys
        System.out.println("\nAll keys:");
        Set<String> keys = cache.keys("*");
        for (String key : keys) {
            System.out.println("- " + key + " = " + cache.get(key));
        }
    }

    /**
     * Scenario 6: Email Gateway
     */
    private static void demonstrateEmailGateway() {
        System.out.println("\n--- Scenario 6: Email Gateway ---");

        EmailGateway emailGateway = new EmailGateway("smtp.example.com", 587);

        // Send simple email
        emailGateway.sendEmail(
            "noreply@example.com",
            "user@example.com",
            "Welcome!",
            "Welcome to our service!"
        );

        // Send email with CC and BCC
        List<String> cc = Arrays.asList("manager@example.com");
        List<String> bcc = Arrays.asList("admin@example.com");
        emailGateway.sendEmail(
            "support@example.com",
            "customer@example.com",
            "Order Confirmation",
            "Your order has been confirmed.",
            cc,
            bcc
        );

        // Send HTML email
        emailGateway.sendHTMLEmail(
            "marketing@example.com",
            "subscriber@example.com",
            "Newsletter",
            "<h1>Latest News</h1><p>Check out our new products!</p>"
        );

        // Send email with attachment
        emailGateway.sendEmailWithAttachment(
            "invoices@example.com",
            "customer@example.com",
            "Invoice #12345",
            "Please find your invoice attached.",
            "/path/to/invoice.pdf"
        );
    }

    /**
     * Scenario 7: Payment Gateway
     */
    private static void demonstratePaymentGateway() {
        System.out.println("\n--- Scenario 7: Payment Gateway ---");

        PaymentGateway paymentGateway = new PaymentGateway("pk_test_123456");

        // Process credit card payment
        CreditCard card = new CreditCard(
            "4242424242424242",
            "12/25",
            "123",
            "John Doe"
        );

        PaymentResult result = paymentGateway.processPayment(card, 99.99, "USD");
        System.out.println("Payment result: " + result.getStatus());
        System.out.println("Transaction ID: " + result.getTransactionId());

        // Refund payment
        if (result.isSuccess()) {
            PaymentResult refundResult = paymentGateway.refundPayment(
                result.getTransactionId(),
                50.00
            );
            System.out.println("\nRefund result: " + refundResult.getStatus());
            System.out.println("Refund ID: " + refundResult.getTransactionId());
        }

        // Get transaction details
        TransactionDetails details = paymentGateway.getTransaction(result.getTransactionId());
        System.out.println("\nTransaction details:");
        System.out.println("Amount: $" + details.getAmount());
        System.out.println("Status: " + details.getStatus());
        System.out.println("Date: " + details.getDate());

        // List recent transactions
        System.out.println("\nRecent transactions:");
        List<TransactionDetails> transactions = paymentGateway.listTransactions(10);
        for (TransactionDetails txn : transactions) {
            System.out.println("- " + txn.getTransactionId() + ": $" + txn.getAmount());
        }
    }

    /**
     * Scenario 8: Message Queue Gateway
     */
    private static void demonstrateMessageQueueGateway() {
        System.out.println("\n--- Scenario 8: Message Queue Gateway ---");

        MessageQueueGateway queueGateway = new MessageQueueGateway("localhost:5672");

        // Publish messages to queue
        queueGateway.publish("email_queue", "Send welcome email to john@example.com");
        queueGateway.publish("email_queue", "Send order confirmation to jane@example.com");
        queueGateway.publish("notification_queue", "Push notification: New message");

        System.out.println("Published 3 messages");

        // Subscribe and consume messages
        System.out.println("\nConsuming from email_queue:");
        queueGateway.subscribe("email_queue", (message) -> {
            System.out.println("Processing: " + message);
        });

        // Get queue size
        System.out.println("\nQueue sizes:");
        System.out.println("email_queue: " + queueGateway.getQueueSize("email_queue"));
        System.out.println("notification_queue: " + queueGateway.getQueueSize("notification_queue"));

        // Purge queue
        queueGateway.purgeQueue("notification_queue");
        System.out.println("\nPurged notification_queue");
        System.out.println("notification_queue size: " + queueGateway.getQueueSize("notification_queue"));
    }

    /**
     * Scenario 9: Cloud Storage Gateway
     */
    private static void demonstrateCloudStorageGateway() {
        System.out.println("\n--- Scenario 9: Cloud Storage Gateway ---");

        CloudStorageGateway storageGateway = new CloudStorageGateway(
            "my-bucket",
            "us-east-1",
            "ACCESS_KEY",
            "SECRET_KEY"
        );

        // Upload file
        byte[] fileData = "Hello, Cloud Storage!".getBytes();
        storageGateway.uploadFile("documents/hello.txt", fileData);
        System.out.println("Uploaded hello.txt");

        // Download file
        byte[] downloadedData = storageGateway.downloadFile("documents/hello.txt");
        System.out.println("Downloaded: " + new String(downloadedData));

        // List files
        System.out.println("\nFiles in bucket:");
        List<String> files = storageGateway.listFiles("documents/");
        for (String file : files) {
            System.out.println("- " + file);
        }

        // Get file metadata
        FileMetadata metadata = storageGateway.getMetadata("documents/hello.txt");
        System.out.println("\nFile metadata:");
        System.out.println("Size: " + metadata.getSize() + " bytes");
        System.out.println("Content-Type: " + metadata.getContentType());
        System.out.println("Last Modified: " + metadata.getLastModified());

        // Generate presigned URL
        String url = storageGateway.generatePresignedUrl("documents/hello.txt", 3600);
        System.out.println("\nPresigned URL (valid for 1 hour):");
        System.out.println(url);

        // Delete file
        storageGateway.deleteFile("documents/hello.txt");
        System.out.println("\nDeleted hello.txt");
    }

    /**
     * Scenario 10: Third-Party Service Gateway
     */
    private static void demonstrateThirdPartyGateway() {
        System.out.println("\n--- Scenario 10: Third-Party Service Gateway ---");

        // SMS Gateway
        SMSGateway smsGateway = new SMSGateway("TWILIO_API_KEY");
        smsGateway.sendSMS("+1234567890", "Your verification code is: 123456");
        System.out.println("Sent SMS");

        // Weather API Gateway
        WeatherGateway weatherGateway = new WeatherGateway("WEATHER_API_KEY");
        WeatherData weather = weatherGateway.getCurrentWeather("New York");
        System.out.println("\nWeather in " + weather.getLocation() + ":");
        System.out.println("Temperature: " + weather.getTemperature() + "°F");
        System.out.println("Condition: " + weather.getCondition());

        // Geocoding Gateway
        GeocodeGateway geocodeGateway = new GeocodeGateway("MAPS_API_KEY");
        Coordinates coords = geocodeGateway.geocode("1600 Amphitheatre Parkway, Mountain View, CA");
        System.out.println("\nGeocoded address:");
        System.out.println("Latitude: " + coords.getLatitude());
        System.out.println("Longitude: " + coords.getLongitude());

        // Translation Gateway
        TranslationGateway translationGateway = new TranslationGateway("TRANSLATE_API_KEY");
        String translated = translationGateway.translate("Hello, World!", "en", "es");
        System.out.println("\nTranslated 'Hello, World!' to Spanish:");
        System.out.println(translated);
    }
}

/**
 * Table Data Gateway - One gateway per table
 */
class UserTableGateway {
    private Map<String, Map<String, Object>> storage = new HashMap<>();

    public void insert(String email, String name, String role) {
        Map<String, Object> user = new HashMap<>();
        user.put("email", email);
        user.put("name", name);
        user.put("role", role);
        user.put("created_at", new Date());
        storage.put(email, user);
        System.out.println("Inserted user: " + email);
    }

    public Map<String, Object> findByEmail(String email) {
        return storage.get(email);
    }

    public List<Map<String, Object>> findAll() {
        return new ArrayList<>(storage.values());
    }

    public void update(String email, String name, String role) {
        Map<String, Object> user = storage.get(email);
        if (user != null) {
            user.put("name", name);
            user.put("role", role);
            user.put("updated_at", new Date());
            System.out.println("Updated user: " + email);
        }
    }

    public void delete(String email) {
        storage.remove(email);
        System.out.println("Deleted user: " + email);
    }

    public int count() {
        return storage.size();
    }
}

/**
 * Row Data Gateway - One instance per row
 */
class ProductRow {
    private static Map<Integer, ProductRow> storage = new HashMap<>();
    private static int nextId = 1;

    private Integer id;
    private String name;
    private String category;
    private double price;
    private int stock;

    public ProductRow(Integer id, String name, String category, double price, int stock) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.stock = stock;
    }

    public void insert() {
        this.id = nextId++;
        storage.put(this.id, this);
        System.out.println("Inserted product: " + name + " (ID: " + id + ")");
    }

    public void update() {
        if (this.id != null) {
            storage.put(this.id, this);
            System.out.println("Updated product: " + name);
        }
    }

    public void delete() {
        if (this.id != null) {
            storage.remove(this.id);
            System.out.println("Deleted product: " + name);
        }
    }

    public static ProductRow load(int id) {
        return storage.get(id);
    }

    // Getters and setters
    public Integer getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
}

/**
 * REST API Gateway
 */
class RESTAPIGateway {
    private String baseUrl;

    public RESTAPIGateway(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String get(String endpoint) {
        System.out.println("GET " + baseUrl + endpoint);
        return "{\"users\": [{\"id\": 1, \"name\": \"John\"}]}";
    }

    public String post(String endpoint, Map<String, Object> data) {
        System.out.println("POST " + baseUrl + endpoint);
        System.out.println("Data: " + data);
        return "{\"id\": 123, \"status\": \"created\"}";
    }

    public String put(String endpoint, Map<String, Object> data) {
        System.out.println("PUT " + baseUrl + endpoint);
        System.out.println("Data: " + data);
        return "{\"status\": \"updated\"}";
    }

    public String delete(String endpoint) {
        System.out.println("DELETE " + baseUrl + endpoint);
        return "{\"status\": \"deleted\"}";
    }
}

/**
 * File System Gateway
 */
class FileSystemGateway {
    private String basePath;
    private Map<String, String> fileStorage = new HashMap<>();

    public FileSystemGateway(String basePath) {
        this.basePath = basePath;
    }

    public void writeFile(String filename, String content) {
        fileStorage.put(filename, content);
    }

    public String readFile(String filename) {
        return fileStorage.getOrDefault(filename, "");
    }

    public List<String> listFiles() {
        return new ArrayList<>(fileStorage.keySet());
    }

    public boolean exists(String filename) {
        return fileStorage.containsKey(filename);
    }

    public void deleteFile(String filename) {
        fileStorage.remove(filename);
    }
}

/**
 * Cache Gateway
 */
class CacheGateway {
    private Map<String, String> cache = new ConcurrentHashMap<>();
    private Map<String, Long> expiry = new ConcurrentHashMap<>();

    public void set(String key, String value) {
        cache.put(key, value);
    }

    public void set(String key, String value, long ttlSeconds) {
        cache.put(key, value);
        expiry.put(key, System.currentTimeMillis() + (ttlSeconds * 1000));
    }

    public String get(String key) {
        if (isExpired(key)) {
            cache.remove(key);
            expiry.remove(key);
            return null;
        }
        return cache.get(key);
    }

    public boolean exists(String key) {
        return cache.containsKey(key) && !isExpired(key);
    }

    public void delete(String key) {
        cache.remove(key);
        expiry.remove(key);
    }

    public void increment(String key) {
        String value = cache.getOrDefault(key, "0");
        int intValue = Integer.parseInt(value);
        cache.put(key, String.valueOf(intValue + 1));
    }

    public Set<String> keys(String pattern) {
        return new HashSet<>(cache.keySet());
    }

    private boolean isExpired(String key) {
        Long expiryTime = expiry.get(key);
        return expiryTime != null && System.currentTimeMillis() > expiryTime;
    }
}

/**
 * Email Gateway
 */
class EmailGateway {
    private String smtpHost;
    private int smtpPort;

    public EmailGateway(String smtpHost, int smtpPort) {
        this.smtpHost = smtpHost;
        this.smtpPort = smtpPort;
    }

    public void sendEmail(String from, String to, String subject, String body) {
        System.out.println("Sending email via " + smtpHost + ":" + smtpPort);
        System.out.println("From: " + from);
        System.out.println("To: " + to);
        System.out.println("Subject: " + subject);
        System.out.println("Body: " + body);
    }

    public void sendEmail(String from, String to, String subject, String body,
                         List<String> cc, List<String> bcc) {
        System.out.println("Sending email with CC/BCC");
        sendEmail(from, to, subject, body);
        System.out.println("CC: " + cc);
        System.out.println("BCC: " + bcc);
    }

    public void sendHTMLEmail(String from, String to, String subject, String htmlBody) {
        System.out.println("Sending HTML email");
        System.out.println("From: " + from);
        System.out.println("To: " + to);
        System.out.println("Subject: " + subject);
        System.out.println("HTML Body: " + htmlBody);
    }

    public void sendEmailWithAttachment(String from, String to, String subject,
                                       String body, String attachmentPath) {
        System.out.println("Sending email with attachment");
        sendEmail(from, to, subject, body);
        System.out.println("Attachment: " + attachmentPath);
    }
}

/**
 * Payment Gateway
 */
class PaymentGateway {
    private String apiKey;
    private List<TransactionDetails> transactions = new ArrayList<>();
    private int nextTxnId = 1000;

    public PaymentGateway(String apiKey) {
        this.apiKey = apiKey;
    }

    public PaymentResult processPayment(CreditCard card, double amount, String currency) {
        System.out.println("Processing payment: $" + amount + " " + currency);
        String txnId = "txn_" + nextTxnId++;
        TransactionDetails details = new TransactionDetails(txnId, amount, "completed", new Date());
        transactions.add(details);
        return new PaymentResult(true, "Payment successful", txnId);
    }

    public PaymentResult refundPayment(String transactionId, double amount) {
        System.out.println("Processing refund: $" + amount + " for " + transactionId);
        String refundId = "refund_" + nextTxnId++;
        return new PaymentResult(true, "Refund successful", refundId);
    }

    public TransactionDetails getTransaction(String transactionId) {
        return transactions.stream()
            .filter(t -> t.getTransactionId().equals(transactionId))
            .findFirst()
            .orElse(null);
    }

    public List<TransactionDetails> listTransactions(int limit) {
        return transactions.subList(0, Math.min(limit, transactions.size()));
    }
}

class CreditCard {
    private String number;
    private String expiry;
    private String cvv;
    private String holderName;

    public CreditCard(String number, String expiry, String cvv, String holderName) {
        this.number = number;
        this.expiry = expiry;
        this.cvv = cvv;
        this.holderName = holderName;
    }
}

class PaymentResult {
    private boolean success;
    private String message;
    private String transactionId;

    public PaymentResult(boolean success, String message, String transactionId) {
        this.success = success;
        this.message = message;
        this.transactionId = transactionId;
    }

    public boolean isSuccess() { return success; }
    public String getStatus() { return success ? "Success" : "Failed"; }
    public String getTransactionId() { return transactionId; }
}

class TransactionDetails {
    private String transactionId;
    private double amount;
    private String status;
    private Date date;

    public TransactionDetails(String transactionId, double amount, String status, Date date) {
        this.transactionId = transactionId;
        this.amount = amount;
        this.status = status;
        this.date = date;
    }

    public String getTransactionId() { return transactionId; }
    public double getAmount() { return amount; }
    public String getStatus() { return status; }
    public Date getDate() { return date; }
}

/**
 * Message Queue Gateway
 */
class MessageQueueGateway {
    private String brokerUrl;
    private Map<String, Queue<String>> queues = new HashMap<>();

    public MessageQueueGateway(String brokerUrl) {
        this.brokerUrl = brokerUrl;
    }

    public void publish(String queueName, String message) {
        queues.computeIfAbsent(queueName, k -> new LinkedList<>()).offer(message);
    }

    public void subscribe(String queueName, MessageConsumer consumer) {
        Queue<String> queue = queues.get(queueName);
        if (queue != null) {
            while (!queue.isEmpty()) {
                consumer.consume(queue.poll());
            }
        }
    }

    public int getQueueSize(String queueName) {
        Queue<String> queue = queues.get(queueName);
        return queue != null ? queue.size() : 0;
    }

    public void purgeQueue(String queueName) {
        Queue<String> queue = queues.get(queueName);
        if (queue != null) {
            queue.clear();
        }
    }
}

interface MessageConsumer {
    void consume(String message);
}

/**
 * Cloud Storage Gateway
 */
class CloudStorageGateway {
    private String bucketName;
    private String region;
    private Map<String, byte[]> storage = new HashMap<>();
    private Map<String, FileMetadata> metadata = new HashMap<>();

    public CloudStorageGateway(String bucketName, String region, String accessKey, String secretKey) {
        this.bucketName = bucketName;
        this.region = region;
    }

    public void uploadFile(String key, byte[] data) {
        storage.put(key, data);
        metadata.put(key, new FileMetadata(data.length, "text/plain", new Date()));
    }

    public byte[] downloadFile(String key) {
        return storage.get(key);
    }

    public List<String> listFiles(String prefix) {
        List<String> files = new ArrayList<>();
        for (String key : storage.keySet()) {
            if (key.startsWith(prefix)) {
                files.add(key);
            }
        }
        return files;
    }

    public FileMetadata getMetadata(String key) {
        return metadata.get(key);
    }

    public String generatePresignedUrl(String key, int expirySeconds) {
        return "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + key +
               "?expires=" + expirySeconds;
    }

    public void deleteFile(String key) {
        storage.remove(key);
        metadata.remove(key);
    }
}

class FileMetadata {
    private long size;
    private String contentType;
    private Date lastModified;

    public FileMetadata(long size, String contentType, Date lastModified) {
        this.size = size;
        this.contentType = contentType;
        this.lastModified = lastModified;
    }

    public long getSize() { return size; }
    public String getContentType() { return contentType; }
    public Date getLastModified() { return lastModified; }
}

/**
 * SMS Gateway
 */
class SMSGateway {
    private String apiKey;

    public SMSGateway(String apiKey) {
        this.apiKey = apiKey;
    }

    public void sendSMS(String phoneNumber, String message) {
        System.out.println("Sending SMS to " + phoneNumber);
        System.out.println("Message: " + message);
    }
}

/**
 * Weather Gateway
 */
class WeatherGateway {
    private String apiKey;

    public WeatherGateway(String apiKey) {
        this.apiKey = apiKey;
    }

    public WeatherData getCurrentWeather(String location) {
        return new WeatherData(location, 72.5, "Partly Cloudy");
    }
}

class WeatherData {
    private String location;
    private double temperature;
    private String condition;

    public WeatherData(String location, double temperature, String condition) {
        this.location = location;
        this.temperature = temperature;
        this.condition = condition;
    }

    public String getLocation() { return location; }
    public double getTemperature() { return temperature; }
    public String getCondition() { return condition; }
}

/**
 * Geocode Gateway
 */
class GeocodeGateway {
    private String apiKey;

    public GeocodeGateway(String apiKey) {
        this.apiKey = apiKey;
    }

    public Coordinates geocode(String address) {
        return new Coordinates(37.4224764, -122.0842499);
    }
}

class Coordinates {
    private double latitude;
    private double longitude;

    public Coordinates(double latitude, double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
}

/**
 * Translation Gateway
 */
class TranslationGateway {
    private String apiKey;

    public TranslationGateway(String apiKey) {
        this.apiKey = apiKey;
    }

    public String translate(String text, String sourceLanguage, String targetLanguage) {
        if (targetLanguage.equals("es")) {
            return "¡Hola, Mundo!";
        }
        return text;
    }
}
