package Integration.RecipientList;

import java.util.*;
import java.time.Instant;
import java.util.concurrent.*;
import java.util.stream.Collectors;

/**
 * RecipientList Pattern - Enterprise Integration Pattern
 *
 * Category: Message Routing
 *
 * Intent:
 * Routes a message to a list of dynamically specified recipients
 *
 * Key Concepts:
 * - Message sent to multiple recipients
 * - Recipient list determined at runtime
 * - Each recipient receives copy of message
 * - Supports variable number of recipients
 *
 * When to Use:
 * - You need to route a message to a list of dynamically specified recipients
 * - You want to decouple system components
 * - You require reliable message processing
 * - You need to scale message handling
 * - You want to maintain system flexibility
 *
 * Benefits:
 * - Loose coupling between components
 * - Scalable message processing
 * - Flexible system architecture
 * - Maintainable integration code
 * - Testable components
 *
 * Real-World Scenarios:
 * 1. Email notifications: Send to multiple subscribers
 * 2. Order notifications: Notify all stakeholders
 * 3. Event broadcasting: Send event to interested parties
 * 4. Report distribution: Distribute to multiple departments
 * 5. Alert fanout: Notify all on-call engineers
 * 6. Audit logging: Send to multiple audit systems
 * 7. Cache invalidation: Notify all cache servers
 * 8. Webhook delivery: Send to registered webhooks
 * 9. Team notifications: Notify team members
 * 10. Multi-channel messaging: Send via email, SMS, push
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 *
 * @author Enterprise Integration Patterns
 * @version 1.0
 */
public class Main {

    private static final String PATTERN_NAME = "RecipientList";
    private static int scenarioCounter = 0;

    public static void main(String[] args) {
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  " + PATTERN_NAME + " Pattern Demonstration" + " ".repeat(70 - PATTERN_NAME.length() - 32) + "║");
        System.out.println("║  Category: Message Routing" + " ".repeat(43) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
        System.out.println();

        System.out.println("Description:");
        System.out.println("  Routes a message to a list of dynamically specified recipients");
        System.out.println();

        System.out.println("Initializing RecipientList infrastructure...");
        MessagingInfrastructure infrastructure = new MessagingInfrastructure();
        RecipientListRouter router = new RecipientListRouter(infrastructure);
        System.out.println("  ✓ Message channels created");
        System.out.println("  ✓ Recipient router initialized");
        System.out.println("  ✓ Infrastructure ready");
        System.out.println();

        demonstrateEmailNotifications(router, infrastructure);
        demonstrateOrderNotifications(router, infrastructure);
        demonstrateEventBroadcasting(router, infrastructure);
        demonstrateReportDistribution(router, infrastructure);
        demonstrateAlertFanout(router, infrastructure);
        demonstrateAuditLogging(router, infrastructure);
        demonstrateCacheInvalidation(router, infrastructure);
        demonstrateWebhookDelivery(router, infrastructure);
        demonstrateTeamNotifications(router, infrastructure);
        demonstrateMultiChannelMessaging(router, infrastructure);

        printSummary(infrastructure);

        System.out.println();
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  Pattern Demonstration Complete" + " ".repeat(70 - 34) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
    }

    private static void demonstrateEmailNotifications(RecipientListRouter router, MessagingInfrastructure infrastructure) {
        startScenario("Email Notifications", "Send to multiple subscribers");

        Message message = new Message("newsletter", "marketing", "Monthly newsletter content");
        List<String> recipients = Arrays.asList("subscriber1@example.com", "subscriber2@example.com",
                                                "subscriber3@example.com", "subscriber4@example.com");

        printStep("Sending newsletter to " + recipients.size() + " subscribers");
        router.routeToRecipients(message, recipients);

        for (String recipient : recipients) {
            printInfo("✓ Delivered to: " + recipient);
        }

        printSuccess("Email notifications completed");
        endScenario();
    }

    private static void demonstrateOrderNotifications(RecipientListRouter router, MessagingInfrastructure infrastructure) {
        startScenario("Order Notifications", "Notify all stakeholders");

        Message message = new Message("order_placed", "system", "Order #12345 placed");
        List<String> stakeholders = Arrays.asList("customer_service", "warehouse",
                                                  "shipping", "billing", "inventory");

        printStep("Notifying " + stakeholders.size() + " departments about new order");
        router.routeToRecipients(message, stakeholders);

        for (String stakeholder : stakeholders) {
            printInfo("✓ Notified: " + stakeholder);
        }

        printSuccess("Order notifications completed");
        endScenario();
    }

    private static void demonstrateEventBroadcasting(RecipientListRouter router, MessagingInfrastructure infrastructure) {
        startScenario("Event Broadcasting", "Send event to interested parties");

        Message message = new Message("user_signed_up", "auth_service", "New user registration");
        message.addHeader("user_id", "user_12345");

        List<String> interestedServices = Arrays.asList("analytics_service", "email_service",
                                                        "crm_service", "reporting_service");

        printStep("Broadcasting user signup event to " + interestedServices.size() + " services");
        router.routeToRecipients(message, interestedServices);

        for (String service : interestedServices) {
            printInfo("✓ Event sent to: " + service);
        }

        printSuccess("Event broadcasting completed");
        endScenario();
    }

    private static void demonstrateReportDistribution(RecipientListRouter router, MessagingInfrastructure infrastructure) {
        startScenario("Report Distribution", "Distribute to multiple departments");

        Message message = new Message("monthly_report", "reporting", "Q4 Financial Report");
        List<String> departments = Arrays.asList("finance", "executives", "board_members",
                                                 "investors", "audit");

        printStep("Distributing quarterly report to " + departments.size() + " recipients");
        router.routeToRecipients(message, departments);

        for (String dept : departments) {
            printInfo("✓ Report sent to: " + dept);
        }

        printSuccess("Report distribution completed");
        endScenario();
    }

    private static void demonstrateAlertFanout(RecipientListRouter router, MessagingInfrastructure infrastructure) {
        startScenario("Alert Fanout", "Notify all on-call engineers");

        Message message = new Message("critical_alert", "monitoring", "Database CPU at 95%");
        message.addHeader("severity", "critical");

        List<String> oncallEngineers = Arrays.asList("engineer1", "engineer2", "engineer3",
                                                     "team_lead", "manager");

        printStep("Sending critical alert to " + oncallEngineers.size() + " engineers");
        router.routeToRecipients(message, oncallEngineers);

        for (String engineer : oncallEngineers) {
            printInfo("✓ Alert sent to: " + engineer);
        }

        printSuccess("Alert fanout completed");
        endScenario();
    }

    private static void demonstrateAuditLogging(RecipientListRouter router, MessagingInfrastructure infrastructure) {
        startScenario("Audit Logging", "Send to multiple audit systems");

        Message message = new Message("audit_event", "payment_service", "Payment processed");
        message.addHeader("transaction_id", "txn_98765");

        List<String> auditSystems = Arrays.asList("primary_audit_log", "backup_audit_log",
                                                  "compliance_system", "security_monitor");

        printStep("Logging to " + auditSystems.size() + " audit systems");
        router.routeToRecipients(message, auditSystems);

        for (String system : auditSystems) {
            printInfo("✓ Logged to: " + system);
        }

        printSuccess("Audit logging completed");
        endScenario();
    }

    private static void demonstrateCacheInvalidation(RecipientListRouter router, MessagingInfrastructure infrastructure) {
        startScenario("Cache Invalidation", "Notify all cache servers");

        Message message = new Message("cache_invalidate", "data_service", "User profile updated");
        message.addHeader("cache_key", "user:12345");

        List<String> cacheServers = Arrays.asList("cache_server_1", "cache_server_2",
                                                  "cache_server_3", "cache_server_4");

        printStep("Invalidating cache on " + cacheServers.size() + " servers");
        router.routeToRecipients(message, cacheServers);

        for (String server : cacheServers) {
            printInfo("✓ Cache invalidated on: " + server);
        }

        printSuccess("Cache invalidation completed");
        endScenario();
    }

    private static void demonstrateWebhookDelivery(RecipientListRouter router, MessagingInfrastructure infrastructure) {
        startScenario("Webhook Delivery", "Send to registered webhooks");

        Message message = new Message("webhook_event", "api_service", "Payment successful");
        message.addHeader("event_type", "payment.success");

        List<String> webhooks = Arrays.asList("https://client1.com/webhook",
                                              "https://client2.com/webhook",
                                              "https://client3.com/webhook");

        printStep("Delivering webhook to " + webhooks.size() + " endpoints");
        router.routeToRecipients(message, webhooks);

        for (String webhook : webhooks) {
            printInfo("✓ Webhook delivered to: " + webhook);
        }

        printSuccess("Webhook delivery completed");
        endScenario();
    }

    private static void demonstrateTeamNotifications(RecipientListRouter router, MessagingInfrastructure infrastructure) {
        startScenario("Team Notifications", "Notify team members");

        Message message = new Message("deployment_notification", "ci_cd", "Production deployment starting");
        message.addHeader("environment", "production");

        List<String> teamMembers = Arrays.asList("developer1", "developer2", "qa_lead",
                                                 "devops", "product_manager");

        printStep("Notifying " + teamMembers.size() + " team members");
        router.routeToRecipients(message, teamMembers);

        for (String member : teamMembers) {
            printInfo("✓ Notification sent to: " + member);
        }

        printSuccess("Team notifications completed");
        endScenario();
    }

    private static void demonstrateMultiChannelMessaging(RecipientListRouter router, MessagingInfrastructure infrastructure) {
        startScenario("Multi-Channel Messaging", "Send via email, SMS, push");

        Message message = new Message("urgent_message", "notification_service", "Security alert");
        message.addHeader("priority", "high");

        List<String> channels = Arrays.asList("email_channel", "sms_channel",
                                              "push_notification_channel", "slack_channel");

        printStep("Sending urgent message via " + channels.size() + " channels");
        router.routeToRecipients(message, channels);

        for (String channel : channels) {
            printInfo("✓ Sent via: " + channel);
        }

        printSuccess("Multi-channel messaging completed");
        endScenario();
    }

    private static void startScenario(String name, String description) {
        scenarioCounter++;
        System.out.println("─".repeat(72));
        System.out.println("Scenario " + scenarioCounter + ": " + name);
        System.out.println("─".repeat(72));
        System.out.println("Description: " + description);
        System.out.println();
    }

    private static void endScenario() {
        System.out.println();
    }

    private static void printSummary(MessagingInfrastructure infrastructure) {
        System.out.println("─".repeat(72));
        System.out.println("Execution Summary");
        System.out.println("─".repeat(72));
        System.out.println("  Total scenarios executed: " + scenarioCounter);
        System.out.println("  Pattern: " + PATTERN_NAME);
        System.out.println("  Category: Message Routing");
        System.out.println("  Total deliveries: " + infrastructure.getDeliveryCount());
        System.out.println("  Status: All scenarios completed");
        System.out.println("─".repeat(72));
    }

    private static void printStep(String step) {
        System.out.println("  → " + step);
    }

    private static void printSuccess(String message) {
        System.out.println("  ✓ " + message);
    }

    private static void printInfo(String message) {
        System.out.println("  " + message);
    }
}

class Message {
    private final String messageId;
    private final String type;
    private final String sender;
    private final String content;
    private final Map<String, String> headers;
    private final long timestamp;

    public Message(String type, String sender, String content) {
        this.messageId = UUID.randomUUID().toString();
        this.type = type;
        this.sender = sender;
        this.content = content;
        this.headers = new HashMap<>();
        this.timestamp = System.currentTimeMillis();
    }

    public String getMessageId() { return messageId; }
    public String getType() { return type; }
    public String getSender() { return sender; }
    public String getContent() { return content; }
    public Map<String, String> getHeaders() { return headers; }
    public long getTimestamp() { return timestamp; }

    public void addHeader(String key, String value) {
        headers.put(key, value);
    }
}

class RecipientListRouter {
    private final MessagingInfrastructure infrastructure;

    public RecipientListRouter(MessagingInfrastructure infrastructure) {
        this.infrastructure = infrastructure;
    }

    public void routeToRecipients(Message message, List<String> recipients) {
        for (String recipient : recipients) {
            infrastructure.deliverMessage(recipient, message);
        }
    }
}

class MessagingInfrastructure {
    private final Map<String, List<Message>> recipientMessages;
    private int deliveryCount;

    public MessagingInfrastructure() {
        this.recipientMessages = new ConcurrentHashMap<>();
        this.deliveryCount = 0;
    }

    public void deliverMessage(String recipient, Message message) {
        recipientMessages.computeIfAbsent(recipient, k -> new ArrayList<>()).add(message);
        deliveryCount++;
    }

    public int getDeliveryCount() {
        return deliveryCount;
    }
}
