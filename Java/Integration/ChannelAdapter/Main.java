package Integration.ChannelAdapter;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * ChannelAdapter Pattern Demonstration
 *
 * The Channel Adapter pattern connects an application to a messaging system.
 * It bridges the gap between application-specific interfaces and generic
 * messaging channels, enabling loose coupling and integration flexibility.
 *
 * Category: Message Endpoints
 *
 * Key Concepts:
 * - Adapts application code to messaging infrastructure
 * - Enables bidirectional communication (inbound and outbound)
 * - Provides transformation between application and message formats
 * - Supports multiple adapter types: file, database, API, JMS, etc.
 * - Facilitates integration with legacy systems
 *
 * Real-world scenarios demonstrated:
 * 1. Legacy System Integration - Connect mainframe systems via messaging
 * 2. External API Connection - Integrate third-party REST APIs
 * 3. Database Change Data Capture - Listen to database triggers
 * 4. File System Watcher - Monitor and process files
 * 5. JMS Queue Integration - Connect to enterprise message queues
 * 6. HTTP Webhook Adapter - Receive webhook notifications
 * 7. Email Integration - Send/receive via email protocols
 * 8. IoT Device Integration - Connect IoT devices to message bus
 * 9. FTP/SFTP Adapter - Transfer files via FTP protocols
 * 10. TCP/UDP Socket Adapter - Low-level network communication
 *
 * Reference: https://www.enterpriseintegrationpatterns.com/patterns/messaging/ChannelAdapter.html
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ChannelAdapter Pattern Demo ===\n");

        // Initialize messaging infrastructure
        MessageChannel messageChannel = new MessageChannel("integration-channel");
        AdapterRegistry registry = new AdapterRegistry();

        // Scenario 1: Legacy System Integration
        System.out.println("--- Scenario 1: Legacy System Integration ---");
        demonstrateLegacySystemIntegration(messageChannel, registry);
        System.out.println();

        // Scenario 2: External API Connection
        System.out.println("--- Scenario 2: External API Connection ---");
        demonstrateExternalAPIConnection(messageChannel, registry);
        System.out.println();

        // Scenario 3: Database Change Data Capture
        System.out.println("--- Scenario 3: Database Change Data Capture ---");
        demonstrateDatabaseCDC(messageChannel, registry);
        System.out.println();

        // Scenario 4: File System Watcher
        System.out.println("--- Scenario 4: File System Watcher ---");
        demonstrateFileSystemWatcher(messageChannel, registry);
        System.out.println();

        // Scenario 5: JMS Queue Integration
        System.out.println("--- Scenario 5: JMS Queue Integration ---");
        demonstrateJMSIntegration(messageChannel, registry);
        System.out.println();

        // Scenario 6: HTTP Webhook Adapter
        System.out.println("--- Scenario 6: HTTP Webhook Adapter ---");
        demonstrateWebhookAdapter(messageChannel, registry);
        System.out.println();

        // Scenario 7: Email Integration
        System.out.println("--- Scenario 7: Email Integration ---");
        demonstrateEmailIntegration(messageChannel, registry);
        System.out.println();

        // Scenario 8: IoT Device Integration
        System.out.println("--- Scenario 8: IoT Device Integration ---");
        demonstrateIoTIntegration(messageChannel, registry);
        System.out.println();

        // Scenario 9: Bidirectional Adapter Flow
        System.out.println("--- Scenario 9: Bidirectional Adapter Flow ---");
        demonstrateBidirectionalFlow(messageChannel, registry);
        System.out.println();

        // Scenario 10: Adapter Error Handling
        System.out.println("--- Scenario 10: Adapter Error Handling ---");
        demonstrateErrorHandling(messageChannel, registry);
        System.out.println();

        System.out.println("=== Pattern demonstration complete ===");
    }

    /**
     * Demonstrates integration with legacy mainframe systems.
     * Legacy systems often use proprietary formats and protocols that need
     * to be adapted to modern messaging infrastructure.
     */
    private static void demonstrateLegacySystemIntegration(MessageChannel channel, AdapterRegistry registry) {
        System.out.println("Setting up legacy mainframe adapter...");

        // Create inbound adapter for legacy system
        InboundChannelAdapter legacyAdapter = new InboundChannelAdapter(
            "LegacyMainframeAdapter",
            channel,
            new LegacySystemPoller()
        );

        // Configure adapter with legacy-specific settings
        Map<String, Object> config = new HashMap<>();
        config.put("host", "mainframe.company.com");
        config.put("port", 3270);
        config.put("pollInterval", 5000);
        config.put("format", "EBCDIC");

        legacyAdapter.configure(config);
        registry.registerAdapter(legacyAdapter);

        // Start polling legacy system
        legacyAdapter.start();

        // Simulate receiving data from legacy system
        System.out.println("Polling legacy mainframe system...");
        System.out.println("Received legacy record: CUST001|John Doe|12345");
        System.out.println("Transforming EBCDIC format to UTF-8...");

        // Create message from legacy data
        Map<String, Object> legacyData = new HashMap<>();
        legacyData.put("customerId", "CUST001");
        legacyData.put("customerName", "John Doe");
        legacyData.put("accountNumber", "12345");
        legacyData.put("source", "LegacyMainframe");

        Message legacyMessage = new Message(legacyData);
        legacyMessage.setHeader("sourceSystem", "Mainframe");
        legacyMessage.setHeader("format", "Transformed");

        channel.send(legacyMessage);
        System.out.println("Legacy data successfully adapted and sent to channel");

        legacyAdapter.stop();
    }

    /**
     * Demonstrates connecting to external REST APIs via channel adapter.
     * The adapter polls the API and converts REST responses to messages.
     */
    private static void demonstrateExternalAPIConnection(MessageChannel channel, AdapterRegistry registry) {
        System.out.println("Setting up REST API adapter...");

        // Create outbound adapter for REST API calls
        OutboundChannelAdapter apiAdapter = new OutboundChannelAdapter(
            "RestAPIAdapter",
            channel,
            new RestAPIHandler()
        );

        Map<String, Object> apiConfig = new HashMap<>();
        apiConfig.put("baseUrl", "https://api.external-service.com");
        apiConfig.put("apiKey", "ABC123XYZ789");
        apiConfig.put("timeout", 30000);
        apiConfig.put("retryCount", 3);

        apiAdapter.configure(apiConfig);
        registry.registerAdapter(apiAdapter);

        // Create message to send to external API
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("endpoint", "/users");
        requestData.put("method", "GET");
        requestData.put("queryParams", Map.of("limit", 10, "offset", 0));

        Message apiRequest = new Message(requestData);
        apiRequest.setHeader("targetAdapter", "RestAPIAdapter");
        apiRequest.setHeader("expectResponse", true);

        System.out.println("Sending request to external API via adapter...");
        channel.send(apiRequest);

        // Simulate API response
        Message response = channel.poll();
        if (response != null) {
            System.out.println("Received API response through adapter");
            System.out.println("Processing and transforming API data...");
            System.out.println("API integration completed successfully!");
        }
    }

    /**
     * Demonstrates database change data capture using triggers and adapters.
     * The adapter listens to database events and publishes them as messages.
     */
    private static void demonstrateDatabaseCDC(MessageChannel channel, AdapterRegistry registry) {
        System.out.println("Setting up database CDC adapter...");

        // Create inbound adapter for database changes
        InboundChannelAdapter dbAdapter = new InboundChannelAdapter(
            "DatabaseCDCAdapter",
            channel,
            new DatabaseChangePoller()
        );

        Map<String, Object> dbConfig = new HashMap<>();
        dbConfig.put("jdbcUrl", "jdbc:postgresql://localhost:5432/mydb");
        dbConfig.put("username", "dbuser");
        dbConfig.put("table", "customers");
        dbConfig.put("pollInterval", 2000);
        dbConfig.put("changeTypes", new String[]{"INSERT", "UPDATE", "DELETE"});

        dbAdapter.configure(dbConfig);
        registry.registerAdapter(dbAdapter);

        dbAdapter.start();

        // Simulate database change events
        System.out.println("Monitoring database table 'customers' for changes...");

        // INSERT event
        Map<String, Object> insertData = new HashMap<>();
        insertData.put("changeType", "INSERT");
        insertData.put("table", "customers");
        insertData.put("primaryKey", Map.of("id", 12345));
        insertData.put("newValues", Map.of(
            "id", 12345,
            "name", "Jane Smith",
            "email", "jane@example.com"
        ));

        Message insertMessage = new Message(insertData);
        insertMessage.setHeader("eventType", "DATABASE_CHANGE");
        insertMessage.setHeader("changeType", "INSERT");

        channel.send(insertMessage);
        System.out.println("Database INSERT event captured and published");

        // UPDATE event
        Map<String, Object> updateData = new HashMap<>();
        updateData.put("changeType", "UPDATE");
        updateData.put("table", "customers");
        updateData.put("primaryKey", Map.of("id", 12345));
        updateData.put("oldValues", Map.of("email", "jane@example.com"));
        updateData.put("newValues", Map.of("email", "jane.smith@example.com"));

        Message updateMessage = new Message(updateData);
        updateMessage.setHeader("eventType", "DATABASE_CHANGE");
        updateMessage.setHeader("changeType", "UPDATE");

        channel.send(updateMessage);
        System.out.println("Database UPDATE event captured and published");

        dbAdapter.stop();
    }

    /**
     * Demonstrates file system watching and processing via adapter.
     * The adapter monitors a directory and creates messages for file changes.
     */
    private static void demonstrateFileSystemWatcher(MessageChannel channel, AdapterRegistry registry) {
        System.out.println("Setting up file system watcher adapter...");

        // Create inbound adapter for file watching
        InboundChannelAdapter fileAdapter = new InboundChannelAdapter(
            "FileSystemAdapter",
            channel,
            new FileSystemPoller()
        );

        Map<String, Object> fileConfig = new HashMap<>();
        fileConfig.put("watchDirectory", "/data/incoming");
        fileConfig.put("filePattern", "*.csv");
        fileConfig.put("processedDirectory", "/data/processed");
        fileConfig.put("errorDirectory", "/data/error");
        fileConfig.put("deleteAfterProcessing", false);

        fileAdapter.configure(fileConfig);
        registry.registerAdapter(fileAdapter);

        fileAdapter.start();

        // Simulate file events
        System.out.println("Watching directory: /data/incoming");
        System.out.println("Detected new file: customers_2024.csv");

        Map<String, Object> fileData = new HashMap<>();
        fileData.put("fileName", "customers_2024.csv");
        fileData.put("filePath", "/data/incoming/customers_2024.csv");
        fileData.put("fileSize", 1024567L);
        fileData.put("eventType", "FILE_CREATED");
        fileData.put("content", "id,name,email\n1,John,john@example.com");

        Message fileMessage = new Message(fileData);
        fileMessage.setHeader("eventType", "FILE_EVENT");
        fileMessage.setHeader("action", "PROCESS");

        channel.send(fileMessage);
        System.out.println("File event published to channel for processing");
        System.out.println("Moving file to processed directory...");

        fileAdapter.stop();
    }

    /**
     * Demonstrates JMS queue integration with channel adapter.
     * The adapter bridges JMS messaging with the internal message channel.
     */
    private static void demonstrateJMSIntegration(MessageChannel channel, AdapterRegistry registry) {
        System.out.println("Setting up JMS queue adapter...");

        // Create bidirectional JMS adapter
        BidirectionalChannelAdapter jmsAdapter = new BidirectionalChannelAdapter(
            "JMSQueueAdapter",
            channel,
            new JMSInboundHandler(),
            new JMSOutboundHandler()
        );

        Map<String, Object> jmsConfig = new HashMap<>();
        jmsConfig.put("brokerUrl", "tcp://localhost:61616");
        jmsConfig.put("queueName", "ORDER.QUEUE");
        jmsConfig.put("username", "admin");
        jmsConfig.put("password", "admin");
        jmsConfig.put("sessionTransacted", true);

        jmsAdapter.configure(jmsConfig);
        registry.registerAdapter(jmsAdapter);

        jmsAdapter.start();

        // Send message to JMS queue via adapter
        System.out.println("Sending message to JMS queue...");

        Map<String, Object> orderData = new HashMap<>();
        orderData.put("orderId", "ORD-2024-789");
        orderData.put("customerId", "CUST-456");
        orderData.put("amount", 499.99);
        orderData.put("status", "PENDING");

        Message jmsMessage = new Message(orderData);
        jmsMessage.setHeader("targetQueue", "ORDER.QUEUE");
        jmsMessage.setHeader("priority", 5);
        jmsMessage.setHeader("persistent", true);

        channel.send(jmsMessage);
        System.out.println("Message sent to JMS queue successfully");

        // Receive message from JMS queue
        System.out.println("Receiving message from JMS queue...");
        Message receivedMessage = channel.poll();
        if (receivedMessage != null) {
            System.out.println("Message received and adapted from JMS");
        }

        jmsAdapter.stop();
    }

    /**
     * Demonstrates HTTP webhook adapter for receiving notifications.
     * The adapter listens for incoming webhooks and converts them to messages.
     */
    private static void demonstrateWebhookAdapter(MessageChannel channel, AdapterRegistry registry) {
        System.out.println("Setting up HTTP webhook adapter...");

        InboundChannelAdapter webhookAdapter = new InboundChannelAdapter(
            "WebhookAdapter",
            channel,
            new WebhookListener()
        );

        Map<String, Object> webhookConfig = new HashMap<>();
        webhookConfig.put("port", 8080);
        webhookConfig.put("path", "/webhooks/payment");
        webhookConfig.put("authenticationType", "HMAC");
        webhookConfig.put("secret", "webhook-secret-key");

        webhookAdapter.configure(webhookConfig);
        registry.registerAdapter(webhookAdapter);

        webhookAdapter.start();

        // Simulate incoming webhook
        System.out.println("Webhook endpoint listening on: http://localhost:8080/webhooks/payment");
        System.out.println("Received webhook notification from payment provider");

        Map<String, Object> webhookPayload = new HashMap<>();
        webhookPayload.put("eventType", "payment.success");
        webhookPayload.put("transactionId", "TXN-987654");
        webhookPayload.put("amount", 299.99);
        webhookPayload.put("currency", "USD");
        webhookPayload.put("timestamp", System.currentTimeMillis());

        Message webhookMessage = new Message(webhookPayload);
        webhookMessage.setHeader("webhookSource", "PaymentProvider");
        webhookMessage.setHeader("verified", true);

        channel.send(webhookMessage);
        System.out.println("Webhook verified and published to channel");

        webhookAdapter.stop();
    }

    /**
     * Demonstrates email integration adapter for sending/receiving emails.
     * The adapter connects to email servers (SMTP/IMAP) and handles email messages.
     */
    private static void demonstrateEmailIntegration(MessageChannel channel, AdapterRegistry registry) {
        System.out.println("Setting up email integration adapter...");

        BidirectionalChannelAdapter emailAdapter = new BidirectionalChannelAdapter(
            "EmailAdapter",
            channel,
            new EmailInboundHandler(),
            new EmailOutboundHandler()
        );

        Map<String, Object> emailConfig = new HashMap<>();
        emailConfig.put("smtpHost", "smtp.company.com");
        emailConfig.put("smtpPort", 587);
        emailConfig.put("imapHost", "imap.company.com");
        emailConfig.put("imapPort", 993);
        emailConfig.put("username", "integration@company.com");
        emailConfig.put("pollInterval", 30000);

        emailAdapter.configure(emailConfig);
        registry.registerAdapter(emailAdapter);

        emailAdapter.start();

        // Send email via adapter
        System.out.println("Sending email through adapter...");

        Map<String, Object> emailData = new HashMap<>();
        emailData.put("to", "customer@example.com");
        emailData.put("from", "noreply@company.com");
        emailData.put("subject", "Order Confirmation #12345");
        emailData.put("body", "Your order has been confirmed and is being processed.");
        emailData.put("contentType", "text/html");

        Message emailMessage = new Message(emailData);
        emailMessage.setHeader("messageType", "EMAIL_OUTBOUND");

        channel.send(emailMessage);
        System.out.println("Email sent successfully via adapter");

        emailAdapter.stop();
    }

    /**
     * Demonstrates IoT device integration for sensor data collection.
     * The adapter connects to IoT devices and publishes sensor readings.
     */
    private static void demonstrateIoTIntegration(MessageChannel channel, AdapterRegistry registry) {
        System.out.println("Setting up IoT device adapter...");

        InboundChannelAdapter iotAdapter = new InboundChannelAdapter(
            "IoTAdapter",
            channel,
            new IoTDevicePoller()
        );

        Map<String, Object> iotConfig = new HashMap<>();
        iotConfig.put("protocol", "MQTT");
        iotConfig.put("broker", "tcp://iot-broker.company.com:1883");
        iotConfig.put("topics", new String[]{"sensors/temperature", "sensors/humidity"});
        iotConfig.put("qos", 1);

        iotAdapter.configure(iotConfig);
        registry.registerAdapter(iotAdapter);

        iotAdapter.start();

        // Simulate IoT sensor data
        System.out.println("Subscribing to IoT sensor topics...");
        System.out.println("Receiving temperature reading from device SENS-001");

        Map<String, Object> sensorData = new HashMap<>();
        sensorData.put("deviceId", "SENS-001");
        sensorData.put("sensorType", "temperature");
        sensorData.put("value", 72.5);
        sensorData.put("unit", "fahrenheit");
        sensorData.put("location", "Building A - Floor 3");
        sensorData.put("timestamp", System.currentTimeMillis());

        Message sensorMessage = new Message(sensorData);
        sensorMessage.setHeader("deviceType", "IoT_Sensor");
        sensorMessage.setHeader("quality", "HIGH");

        channel.send(sensorMessage);
        System.out.println("Sensor data published to channel for processing");

        iotAdapter.stop();
    }

    /**
     * Demonstrates bidirectional adapter flow with request-reply pattern.
     * The adapter handles both inbound and outbound message flow.
     */
    private static void demonstrateBidirectionalFlow(MessageChannel channel, AdapterRegistry registry) {
        System.out.println("Setting up bidirectional adapter...");

        BidirectionalChannelAdapter biAdapter = new BidirectionalChannelAdapter(
            "BidirectionalAdapter",
            channel,
            new GenericInboundHandler(),
            new GenericOutboundHandler()
        );

        Map<String, Object> config = new HashMap<>();
        config.put("inboundEndpoint", "tcp://0.0.0.0:9000");
        config.put("outboundEndpoint", "tcp://partner-system.com:9000");
        config.put("bufferSize", 8192);

        biAdapter.configure(config);
        registry.registerAdapter(biAdapter);

        biAdapter.start();

        // Outbound: Send request
        System.out.println("Sending outbound request via adapter...");

        Map<String, Object> requestData = new HashMap<>();
        requestData.put("operation", "GET_STATUS");
        requestData.put("resourceId", "RES-12345");

        Message request = new Message(requestData);
        request.setHeader("direction", "OUTBOUND");
        request.setHeader("expectReply", true);

        channel.send(request);
        System.out.println("Outbound request sent");

        // Inbound: Receive response
        System.out.println("Waiting for inbound response...");

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("status", "ACTIVE");
        responseData.put("resourceId", "RES-12345");
        responseData.put("lastModified", System.currentTimeMillis());

        Message response = new Message(responseData);
        response.setHeader("direction", "INBOUND");
        response.setHeader("correlationId", request.getMessageId());

        channel.send(response);
        System.out.println("Inbound response received and processed");

        biAdapter.stop();
    }

    /**
     * Demonstrates adapter error handling and recovery mechanisms.
     * Shows how adapters handle connection failures, timeouts, and retries.
     */
    private static void demonstrateErrorHandling(MessageChannel channel, AdapterRegistry registry) {
        System.out.println("Setting up adapter with error handling...");

        InboundChannelAdapter resilientAdapter = new InboundChannelAdapter(
            "ResilientAdapter",
            channel,
            new FailurePronePoller()
        );

        Map<String, Object> config = new HashMap<>();
        config.put("maxRetries", 3);
        config.put("retryDelay", 1000);
        config.put("circuitBreakerThreshold", 5);
        config.put("healthCheckInterval", 5000);
        config.put("fallbackEnabled", true);

        resilientAdapter.configure(config);
        registry.registerAdapter(resilientAdapter);

        resilientAdapter.start();

        // Simulate connection failure
        System.out.println("Simulating connection failure...");
        System.out.println("Connection attempt 1: FAILED");
        System.out.println("Waiting 1000ms before retry...");
        System.out.println("Connection attempt 2: FAILED");
        System.out.println("Waiting 1000ms before retry...");
        System.out.println("Connection attempt 3: SUCCESS");

        // Successfully send message after recovery
        Map<String, Object> data = new HashMap<>();
        data.put("status", "recovered");
        data.put("failureCount", 2);
        data.put("recoveryTime", System.currentTimeMillis());

        Message recoveryMessage = new Message(data);
        recoveryMessage.setHeader("eventType", "RECOVERY");

        channel.send(recoveryMessage);
        System.out.println("Adapter recovered and message sent successfully");

        resilientAdapter.stop();

        System.out.println("\nAdapter Statistics:");
        System.out.println("Total Messages: 1");
        System.out.println("Failed Attempts: 2");
        System.out.println("Successful Attempts: 1");
        System.out.println("Success Rate: 100%");
    }
}
