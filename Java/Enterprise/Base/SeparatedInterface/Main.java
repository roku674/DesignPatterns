package Enterprise.Base.SeparatedInterface;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * Separated Interface Pattern Demonstration
 *
 * Intent: Define an interface in a separate package from its implementation
 *
 * Use When:
 * - You want to break package dependencies
 * - Client code shouldn't depend on implementation details
 * - You need to support multiple implementations
 * - Testing requires mock implementations
 * - You want to enforce architectural boundaries
 *
 * Enterprise Context:
 * In enterprise applications, separating interfaces from implementations
 * enables clean architecture, easier testing, and flexibility in choosing
 * implementations. This pattern is fundamental to dependency inversion.
 */
public class Main {

    // ==================== CLIENT LAYER ====================

    /**
     * Client interfaces - what the client needs
     * These are defined in the client's package, not the implementation's
     */
    interface PaymentGateway {
        PaymentResult processPayment(PaymentRequest request);
        PaymentResult refund(String transactionId, double amount);
        PaymentStatus checkStatus(String transactionId);
    }

    interface NotificationService {
        void sendNotification(Notification notification);
        void sendBulk(List<Notification> notifications);
        DeliveryStatus checkDeliveryStatus(String notificationId);
    }

    interface DataRepository {
        void save(Entity entity);
        Entity findById(String id);
        List<Entity> findAll();
        void delete(String id);
        List<Entity> query(QueryCriteria criteria);
    }

    interface AuthenticationService {
        AuthenticationResult authenticate(String username, String password);
        boolean validateToken(String token);
        void logout(String token);
        User getCurrentUser(String token);
    }

    interface CacheProvider {
        void put(String key, Object value, int ttlSeconds);
        Object get(String key);
        void invalidate(String key);
        void clear();
        boolean exists(String key);
    }

    interface MessageQueue {
        void publish(String topic, Message message);
        void subscribe(String topic, MessageHandler handler);
        void unsubscribe(String topic);
    }

    // ==================== DATA TRANSFER OBJECTS ====================

    static class PaymentRequest {
        private final String accountId;
        private final double amount;
        private final String currency;
        private final Map<String, String> metadata;

        public PaymentRequest(String accountId, double amount, String currency) {
            this.accountId = accountId;
            this.amount = amount;
            this.currency = currency;
            this.metadata = new HashMap<>();
        }

        public String getAccountId() { return accountId; }
        public double getAmount() { return amount; }
        public String getCurrency() { return currency; }
        public Map<String, String> getMetadata() { return metadata; }
    }

    static class PaymentResult {
        private final boolean success;
        private final String transactionId;
        private final String message;

        public PaymentResult(boolean success, String transactionId, String message) {
            this.success = success;
            this.transactionId = transactionId;
            this.message = message;
        }

        public boolean isSuccess() { return success; }
        public String getTransactionId() { return transactionId; }
        public String getMessage() { return message; }
    }

    enum PaymentStatus {
        PENDING, COMPLETED, FAILED, REFUNDED
    }

    static class Notification {
        private final String id;
        private final String recipient;
        private final String subject;
        private final String body;
        private final NotificationType type;

        public Notification(String id, String recipient, String subject, String body, NotificationType type) {
            this.id = id;
            this.recipient = recipient;
            this.subject = subject;
            this.body = body;
            this.type = type;
        }

        public String getId() { return id; }
        public String getRecipient() { return recipient; }
        public String getSubject() { return subject; }
        public String getBody() { return body; }
        public NotificationType getType() { return type; }
    }

    enum NotificationType {
        EMAIL, SMS, PUSH, WEBHOOK
    }

    enum DeliveryStatus {
        QUEUED, SENT, DELIVERED, FAILED, BOUNCED
    }

    interface Entity {
        String getId();
        void setId(String id);
    }

    static class Customer implements Entity {
        private String id;
        private String name;
        private String email;

        public Customer(String name, String email) {
            this.name = name;
            this.email = email;
        }

        @Override
        public String getId() { return id; }
        @Override
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
    }

    static class QueryCriteria {
        private final Map<String, Object> criteria = new HashMap<>();

        public QueryCriteria add(String field, Object value) {
            criteria.put(field, value);
            return this;
        }

        public Map<String, Object> getCriteria() {
            return new HashMap<>(criteria);
        }
    }

    static class AuthenticationResult {
        private final boolean authenticated;
        private final String token;
        private final User user;
        private final String message;

        public AuthenticationResult(boolean authenticated, String token, User user, String message) {
            this.authenticated = authenticated;
            this.token = token;
            this.user = user;
            this.message = message;
        }

        public boolean isAuthenticated() { return authenticated; }
        public String getToken() { return token; }
        public User getUser() { return user; }
        public String getMessage() { return message; }
    }

    static class User {
        private final String username;
        private final String email;
        private final Set<String> roles;

        public User(String username, String email, Set<String> roles) {
            this.username = username;
            this.email = email;
            this.roles = roles;
        }

        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public Set<String> getRoles() { return new HashSet<>(roles); }
    }

    static class Message {
        private final String id;
        private final String content;
        private final Map<String, String> headers;
        private final LocalDateTime timestamp;

        public Message(String id, String content) {
            this.id = id;
            this.content = content;
            this.headers = new HashMap<>();
            this.timestamp = LocalDateTime.now();
        }

        public String getId() { return id; }
        public String getContent() { return content; }
        public Map<String, String> getHeaders() { return headers; }
        public LocalDateTime getTimestamp() { return timestamp; }
    }

    interface MessageHandler {
        void handle(Message message);
    }

    // ==================== IMPLEMENTATIONS ====================
    // These would typically be in separate packages/modules

    /**
     * Stripe Payment Gateway Implementation
     */
    static class StripePaymentGateway implements PaymentGateway {
        private final Map<String, PaymentStatus> transactions = new HashMap<>();
        private int transactionCounter = 1000;

        @Override
        public PaymentResult processPayment(PaymentRequest request) {
            String txnId = "STRIPE-" + (transactionCounter++);
            transactions.put(txnId, PaymentStatus.COMPLETED);
            System.out.println("Stripe: Processing payment " + txnId + " for $" + request.getAmount());
            return new PaymentResult(true, txnId, "Payment processed successfully");
        }

        @Override
        public PaymentResult refund(String transactionId, double amount) {
            if (transactions.containsKey(transactionId)) {
                transactions.put(transactionId, PaymentStatus.REFUNDED);
                System.out.println("Stripe: Refunded $" + amount + " for " + transactionId);
                return new PaymentResult(true, transactionId, "Refund processed");
            }
            return new PaymentResult(false, transactionId, "Transaction not found");
        }

        @Override
        public PaymentStatus checkStatus(String transactionId) {
            return transactions.getOrDefault(transactionId, PaymentStatus.FAILED);
        }
    }

    /**
     * Email Notification Service Implementation
     */
    static class EmailNotificationService implements NotificationService {
        private final Map<String, DeliveryStatus> deliveries = new HashMap<>();

        @Override
        public void sendNotification(Notification notification) {
            System.out.println("Email sent to " + notification.getRecipient() +
                             ": " + notification.getSubject());
            deliveries.put(notification.getId(), DeliveryStatus.SENT);
        }

        @Override
        public void sendBulk(List<Notification> notifications) {
            System.out.println("Sending " + notifications.size() + " bulk emails");
            for (Notification notification : notifications) {
                sendNotification(notification);
            }
        }

        @Override
        public DeliveryStatus checkDeliveryStatus(String notificationId) {
            return deliveries.getOrDefault(notificationId, DeliveryStatus.FAILED);
        }
    }

    /**
     * In-Memory Data Repository Implementation
     */
    static class InMemoryRepository implements DataRepository {
        private final Map<String, Entity> storage = new HashMap<>();
        private int idCounter = 1;

        @Override
        public void save(Entity entity) {
            if (entity.getId() == null) {
                entity.setId("ENT-" + (idCounter++));
            }
            storage.put(entity.getId(), entity);
            System.out.println("Saved entity: " + entity.getId());
        }

        @Override
        public Entity findById(String id) {
            return storage.get(id);
        }

        @Override
        public List<Entity> findAll() {
            return new ArrayList<>(storage.values());
        }

        @Override
        public void delete(String id) {
            Entity removed = storage.remove(id);
            if (removed != null) {
                System.out.println("Deleted entity: " + id);
            }
        }

        @Override
        public List<Entity> query(QueryCriteria criteria) {
            // Simple implementation - just return all
            System.out.println("Querying with criteria: " + criteria.getCriteria().size() + " filters");
            return findAll();
        }
    }

    /**
     * JWT Authentication Service Implementation
     */
    static class JwtAuthenticationService implements AuthenticationService {
        private final Map<String, User> users = new HashMap<>();
        private final Map<String, User> activeTokens = new HashMap<>();
        private int tokenCounter = 5000;

        public JwtAuthenticationService() {
            // Add some test users
            users.put("admin", new User("admin", "admin@example.com",
                new HashSet<>(Arrays.asList("ADMIN", "USER"))));
            users.put("user", new User("user", "user@example.com",
                new HashSet<>(Collections.singletonList("USER"))));
        }

        @Override
        public AuthenticationResult authenticate(String username, String password) {
            User user = users.get(username);
            if (user != null && password.equals("password")) {
                String token = "JWT-" + (tokenCounter++);
                activeTokens.put(token, user);
                System.out.println("User authenticated: " + username);
                return new AuthenticationResult(true, token, user, "Login successful");
            }
            return new AuthenticationResult(false, null, null, "Invalid credentials");
        }

        @Override
        public boolean validateToken(String token) {
            return activeTokens.containsKey(token);
        }

        @Override
        public void logout(String token) {
            User user = activeTokens.remove(token);
            if (user != null) {
                System.out.println("User logged out: " + user.getUsername());
            }
        }

        @Override
        public User getCurrentUser(String token) {
            return activeTokens.get(token);
        }
    }

    /**
     * Redis Cache Provider Implementation
     */
    static class RedisCacheProvider implements CacheProvider {
        private final Map<String, CacheEntry> cache = new HashMap<>();

        static class CacheEntry {
            final Object value;
            final long expiresAt;

            CacheEntry(Object value, long expiresAt) {
                this.value = value;
                this.expiresAt = expiresAt;
            }

            boolean isExpired() {
                return System.currentTimeMillis() > expiresAt;
            }
        }

        @Override
        public void put(String key, Object value, int ttlSeconds) {
            long expiresAt = System.currentTimeMillis() + (ttlSeconds * 1000L);
            cache.put(key, new CacheEntry(value, expiresAt));
            System.out.println("Cached: " + key + " (TTL: " + ttlSeconds + "s)");
        }

        @Override
        public Object get(String key) {
            CacheEntry entry = cache.get(key);
            if (entry != null && !entry.isExpired()) {
                return entry.value;
            }
            if (entry != null && entry.isExpired()) {
                cache.remove(key);
            }
            return null;
        }

        @Override
        public void invalidate(String key) {
            cache.remove(key);
            System.out.println("Invalidated: " + key);
        }

        @Override
        public void clear() {
            cache.clear();
            System.out.println("Cache cleared");
        }

        @Override
        public boolean exists(String key) {
            CacheEntry entry = cache.get(key);
            return entry != null && !entry.isExpired();
        }
    }

    /**
     * In-Memory Message Queue Implementation
     */
    static class InMemoryMessageQueue implements MessageQueue {
        private final Map<String, List<MessageHandler>> subscribers = new HashMap<>();

        @Override
        public void publish(String topic, Message message) {
            System.out.println("Publishing to topic '" + topic + "': " + message.getContent());
            List<MessageHandler> handlers = subscribers.get(topic);
            if (handlers != null) {
                for (MessageHandler handler : handlers) {
                    CompletableFuture.runAsync(() -> handler.handle(message));
                }
            }
        }

        @Override
        public void subscribe(String topic, MessageHandler handler) {
            subscribers.computeIfAbsent(topic, k -> new ArrayList<>()).add(handler);
            System.out.println("Subscribed to topic: " + topic);
        }

        @Override
        public void unsubscribe(String topic) {
            subscribers.remove(topic);
            System.out.println("Unsubscribed from topic: " + topic);
        }
    }

    // ==================== CLIENT APPLICATION ====================

    /**
     * Application Service using separated interfaces
     * Depends only on interfaces, not implementations
     */
    static class OrderService {
        private final PaymentGateway paymentGateway;
        private final NotificationService notificationService;
        private final DataRepository repository;

        public OrderService(PaymentGateway paymentGateway,
                          NotificationService notificationService,
                          DataRepository repository) {
            this.paymentGateway = paymentGateway;
            this.notificationService = notificationService;
            this.repository = repository;
        }

        public void processOrder(Customer customer, double amount) {
            System.out.println("\n--- Processing Order ---");

            // Save customer
            repository.save(customer);

            // Process payment
            PaymentRequest request = new PaymentRequest(customer.getId(), amount, "USD");
            PaymentResult result = paymentGateway.processPayment(request);

            if (result.isSuccess()) {
                // Send notification
                Notification notification = new Notification(
                    "NOTIF-" + result.getTransactionId(),
                    customer.getEmail(),
                    "Order Confirmation",
                    "Your order has been confirmed. Transaction: " + result.getTransactionId(),
                    NotificationType.EMAIL
                );
                notificationService.sendNotification(notification);

                System.out.println("Order processed successfully!");
            } else {
                System.out.println("Order failed: " + result.getMessage());
            }
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Separated Interface Pattern Demo ===\n");

        // Scenario 1: Payment Gateway - Stripe Implementation
        System.out.println("--- Scenario 1: Payment Processing with Stripe ---");
        PaymentGateway stripeGateway = new StripePaymentGateway();
        PaymentRequest payment1 = new PaymentRequest("ACC-001", 99.99, "USD");
        PaymentResult result1 = stripeGateway.processPayment(payment1);
        System.out.println("Payment result: " + result1.getMessage());
        System.out.println("Transaction ID: " + result1.getTransactionId());

        // Scenario 2: Payment Refund
        System.out.println("\n--- Scenario 2: Payment Refund ---");
        PaymentResult refundResult = stripeGateway.refund(result1.getTransactionId(), 50.00);
        System.out.println("Refund result: " + refundResult.getMessage());
        PaymentStatus status = stripeGateway.checkStatus(result1.getTransactionId());
        System.out.println("Transaction status: " + status);

        // Scenario 3: Notification Service
        System.out.println("\n--- Scenario 3: Email Notifications ---");
        NotificationService emailService = new EmailNotificationService();
        Notification notif1 = new Notification("N001", "user@example.com",
            "Welcome", "Welcome to our service!", NotificationType.EMAIL);
        emailService.sendNotification(notif1);

        // Scenario 4: Bulk Notifications
        System.out.println("\n--- Scenario 4: Bulk Notifications ---");
        List<Notification> bulkNotifs = Arrays.asList(
            new Notification("N002", "user1@example.com", "Newsletter", "Monthly update", NotificationType.EMAIL),
            new Notification("N003", "user2@example.com", "Newsletter", "Monthly update", NotificationType.EMAIL),
            new Notification("N004", "user3@example.com", "Newsletter", "Monthly update", NotificationType.EMAIL)
        );
        emailService.sendBulk(bulkNotifs);

        // Scenario 5: Data Repository
        System.out.println("\n--- Scenario 5: Data Persistence ---");
        DataRepository repository = new InMemoryRepository();
        Customer customer1 = new Customer("John Doe", "john@example.com");
        Customer customer2 = new Customer("Jane Smith", "jane@example.com");

        repository.save(customer1);
        repository.save(customer2);

        List<Entity> allCustomers = repository.findAll();
        System.out.println("Total customers: " + allCustomers.size());

        // Scenario 6: Data Querying
        System.out.println("\n--- Scenario 6: Data Querying ---");
        QueryCriteria criteria = new QueryCriteria()
            .add("status", "active")
            .add("country", "USA");
        List<Entity> results = repository.query(criteria);
        System.out.println("Query returned: " + results.size() + " results");

        // Scenario 7: Authentication
        System.out.println("\n--- Scenario 7: User Authentication ---");
        AuthenticationService authService = new JwtAuthenticationService();
        AuthenticationResult authResult = authService.authenticate("admin", "password");
        if (authResult.isAuthenticated()) {
            System.out.println("Login successful!");
            System.out.println("Token: " + authResult.getToken());
            System.out.println("User roles: " + authResult.getUser().getRoles());
        }

        // Scenario 8: Token Validation
        System.out.println("\n--- Scenario 8: Token Validation ---");
        boolean valid = authService.validateToken(authResult.getToken());
        System.out.println("Token valid: " + valid);
        User currentUser = authService.getCurrentUser(authResult.getToken());
        System.out.println("Current user: " + currentUser.getUsername());

        // Scenario 9: Cache Operations
        System.out.println("\n--- Scenario 9: Caching ---");
        CacheProvider cache = new RedisCacheProvider();
        cache.put("user:1", customer1, 60);
        cache.put("session:abc", "active", 300);

        Customer cachedCustomer = (Customer) cache.get("user:1");
        if (cachedCustomer != null) {
            System.out.println("Retrieved from cache: " + cachedCustomer.getName());
        }

        System.out.println("Cache exists 'user:1': " + cache.exists("user:1"));
        cache.invalidate("session:abc");

        // Scenario 10: Message Queue
        System.out.println("\n--- Scenario 10: Message Queue ---");
        MessageQueue queue = new InMemoryMessageQueue();

        queue.subscribe("orders", message ->
            System.out.println("Order handler received: " + message.getContent()));

        queue.subscribe("notifications", message ->
            System.out.println("Notification handler received: " + message.getContent()));

        queue.publish("orders", new Message("M001", "New order placed"));
        queue.publish("notifications", new Message("M002", "Send welcome email"));

        // Scenario 11: Complete Order Flow
        System.out.println("\n--- Scenario 11: Complete Order Processing ---");
        OrderService orderService = new OrderService(stripeGateway, emailService, repository);
        Customer customer3 = new Customer("Bob Johnson", "bob@example.com");
        orderService.processOrder(customer3, 149.99);

        // Scenario 12: Logout
        System.out.println("\n--- Scenario 12: User Logout ---");
        authService.logout(authResult.getToken());
        boolean validAfterLogout = authService.validateToken(authResult.getToken());
        System.out.println("Token valid after logout: " + validAfterLogout);

        System.out.println("\n=== Benefits of Separated Interface ===");
        System.out.println("1. Breaks package/module dependencies");
        System.out.println("2. Enables easy testing with mocks");
        System.out.println("3. Supports multiple implementations");
        System.out.println("4. Enforces dependency inversion principle");
        System.out.println("5. Improves code maintainability and flexibility");

        System.out.println("\nPattern demonstration complete.");
    }
}
