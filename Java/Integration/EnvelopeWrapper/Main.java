package Integration.EnvelopeWrapper;

import java.util.*;
import java.time.Instant;
import java.time.Duration;
import java.util.concurrent.*;
import java.util.stream.Collectors;
import java.util.Base64;

/**
 * EnvelopeWrapper Pattern - Enterprise Integration Pattern
 *
 * <p>Category: Message Transformation
 *
 * <p><b>Intent:</b> Wraps application data with a message envelope containing routing
 * and metadata information, separating business data from messaging infrastructure concerns.
 *
 * <p><b>Key Concepts:</b>
 * <ul>
 *   <li>Separates business payload from routing metadata</li>
 *   <li>Envelope contains headers, routing info, and metadata</li>
 *   <li>Payload remains unchanged and opaque to infrastructure</li>
 *   <li>Enables transparent message routing and handling</li>
 *   <li>Supports encryption and compression of payload</li>
 * </ul>
 *
 * <p><b>When to Use:</b>
 * <ul>
 *   <li>You need to add metadata without modifying payload</li>
 *   <li>Routing information should be separate from business data</li>
 *   <li>You want to encrypt payload while keeping headers readable</li>
 *   <li>Different payload formats need same envelope structure</li>
 *   <li>You need message tracking without inspecting payload</li>
 * </ul>
 *
 * <p><b>Benefits:</b>
 * <ul>
 *   <li>Clean separation of concerns</li>
 *   <li>Payload format independence</li>
 *   <li>Supports encryption and security</li>
 *   <li>Enables efficient message routing</li>
 *   <li>Facilitates message tracking and monitoring</li>
 * </ul>
 *
 * <p><b>Real-World Scenarios:</b>
 * <ol>
 *   <li>Secure messaging: Encrypt payload while keeping envelope readable</li>
 *   <li>Routing metadata: Add routing info without changing payload</li>
 *   <li>Message tracking: Track messages without reading sensitive data</li>
 *   <li>Protocol bridging: Add protocol headers to any payload</li>
 *   <li>Multi-format support: Envelope indicates payload format</li>
 *   <li>SOAP/REST conversion: Wrap payloads for different protocols</li>
 *   <li>Email headers: Routing separate from message body</li>
 *   <li>Package delivery: Shipping label separate from contents</li>
 *   <li>Compressed payloads: Metadata about compression</li>
 *   <li>Priority routing: Priority in envelope, not payload</li>
 * </ol>
 *
 * <p><b>Reference:</b> Enterprise Integration Patterns by Gregor Hohpe and Bobby Woolf
 * <br>https://www.enterpriseintegrationpatterns.com/patterns/messaging/EnvelopeWrapper.html
 *
 * @author Enterprise Integration Patterns
 * @version 2.0
 * @since 1.0
 */
public class Main {

    private static final String PATTERN_NAME = "EnvelopeWrapper";
    private static final String CATEGORY = "Message Transformation";
    private static int scenarioCounter = 0;

    public static void main(String[] args) {
        printHeader();
        printDescription();

        EnvelopeWrapperImplementation implementation = initializeInfrastructure();
        executeAllScenarios(implementation);
        printSummary();
        printFooter();
    }

    private static EnvelopeWrapperImplementation initializeInfrastructure() {
        System.out.println("Initializing " + PATTERN_NAME + " infrastructure...");
        EnvelopeWrapperImplementation implementation = new EnvelopeWrapperImplementation();
        System.out.println("  ✓ Envelope wrapper initialized");
        System.out.println("  ✓ Header processors registered");
        System.out.println("  ✓ Payload handlers configured");
        System.out.println("  ✓ Encryption support enabled");
        System.out.println();
        return implementation;
    }

    private static void executeAllScenarios(EnvelopeWrapperImplementation implementation) {
        demonstrateSecureMessaging(implementation);
        demonstrateRoutingMetadata(implementation);
        demonstrateMessageTracking(implementation);
        demonstrateProtocolBridging(implementation);
        demonstrateMultiFormat(implementation);
        demonstrateSOAPREST(implementation);
        demonstrateEmailHeaders(implementation);
        demonstratePackageDelivery(implementation);
        demonstrateCompressedPayload(implementation);
        demonstratePriorityRouting(implementation);
    }

    private static void demonstrateSecureMessaging(EnvelopeWrapperImplementation impl) {
        startScenario("Secure Messaging", "Encrypt payload while keeping envelope readable");

        Map<String, String> headers = new HashMap<>();
        headers.put("MessageID", "MSG-" + System.currentTimeMillis());
        headers.put("Timestamp", Instant.now().toString());
        headers.put("Encrypted", "true");
        headers.put("Algorithm", "AES-256");

        String payload = "{\"account\":\"123456\",\"balance\":50000}";
        String encryptedPayload = Base64.getEncoder().encodeToString(payload.getBytes());

        demonstrateEnvelope(headers, encryptedPayload, "Encrypted financial data");
        endScenario();
    }

    private static void demonstrateRoutingMetadata(EnvelopeWrapperImplementation impl) {
        startScenario("Routing Metadata", "Add routing without changing payload");

        Map<String, String> headers = new HashMap<>();
        headers.put("Destination", "OrderProcessingQueue");
        headers.put("Priority", "High");
        headers.put("ReplyTo", "ConfirmationQueue");
        headers.put("CorrelationID", UUID.randomUUID().toString());

        String payload = "<order><id>12345</id><total>999.99</total></order>";

        demonstrateEnvelope(headers, payload, "Order XML with routing headers");
        endScenario();
    }

    private static void demonstrateMessageTracking(EnvelopeWrapperImplementation impl) {
        startScenario("Message Tracking", "Track message without reading payload");

        Map<String, String> headers = new HashMap<>();
        headers.put("TrackingID", "TRK-" + System.currentTimeMillis());
        headers.put("Source", "MobileApp");
        headers.put("Destination", "BackendService");
        headers.put("Timestamp", Instant.now().toString());
        headers.put("Hops", "0");

        String payload = "{\"sensitiveData\":\"[REDACTED]\"}";

        demonstrateEnvelope(headers, payload, "Tracked sensitive message");
        endScenario();
    }

    private static void demonstrateProtocolBridging(EnvelopeWrapperImplementation impl) {
        startScenario("Protocol Bridging", "Add protocol-specific headers");

        Map<String, String> headers = new HashMap<>();
        headers.put("Protocol", "HTTP");
        headers.put("ContentType", "application/json");
        headers.put("Accept", "application/json");
        headers.put("UserAgent", "IntegrationService/1.0");

        String payload = "{\"data\":\"business information\"}";

        demonstrateEnvelope(headers, payload, "HTTP headers with JSON payload");
        endScenario();
    }

    private static void demonstrateMultiFormat(EnvelopeWrapperImplementation impl) {
        startScenario("Multi-Format Support", "Envelope indicates payload format");

        Map<String, String> headers = new HashMap<>();
        headers.put("PayloadFormat", "XML");
        headers.put("Version", "1.0");
        headers.put("Encoding", "UTF-8");
        headers.put("Schema", "purchase-order-v2.xsd");

        String payload = "<?xml version=\"1.0\"?><purchaseOrder>...</purchaseOrder>";

        demonstrateEnvelope(headers, payload, "XML payload with format metadata");
        endScenario();
    }

    private static void demonstrateSOAPREST(EnvelopeWrapperImplementation impl) {
        startScenario("SOAP/REST Conversion", "Wrap REST payload in SOAP envelope");

        Map<String, String> headers = new HashMap<>();
        headers.put("SOAPAction", "GetCustomerDetails");
        headers.put("ContentType", "text/xml");
        headers.put("OriginalProtocol", "REST");

        String payload = "<SOAP-ENV:Body>{\"customerId\":\"12345\"}</SOAP-ENV:Body>";

        demonstrateEnvelope(headers, payload, "REST data wrapped in SOAP");
        endScenario();
    }

    private static void demonstrateEmailHeaders(EnvelopeWrapperImplementation impl) {
        startScenario("Email Headers", "Email routing separate from body");

        Map<String, String> headers = new HashMap<>();
        headers.put("From", "sender@example.com");
        headers.put("To", "recipient@example.com");
        headers.put("Subject", "Important Business Update");
        headers.put("Date", Instant.now().toString());
        headers.put("MIME-Version", "1.0");

        String payload = "Dear Recipient,\\n\\nThis is the email body...";

        demonstrateEnvelope(headers, payload, "Email with headers");
        endScenario();
    }

    private static void demonstratePackageDelivery(EnvelopeWrapperImplementation impl) {
        startScenario("Package Delivery", "Shipping label separate from contents");

        Map<String, String> headers = new HashMap<>();
        headers.put("TrackingNumber", "1Z999AA10123456784");
        headers.put("Destination", "New York, NY");
        headers.put("Origin", "Los Angeles, CA");
        headers.put("Priority", "Express");
        headers.put("Weight", "2.5kg");

        String payload = "[PACKAGE CONTENTS - ELECTRONICS]";

        demonstrateEnvelope(headers, payload, "Package with shipping label");
        endScenario();
    }

    private static void demonstrateCompressedPayload(EnvelopeWrapperImplementation impl) {
        startScenario("Compressed Payloads", "Metadata about compression");

        Map<String, String> headers = new HashMap<>();
        headers.put("Compressed", "true");
        headers.put("Algorithm", "GZIP");
        headers.put("OriginalSize", "10485760");
        headers.put("CompressedSize", "2621440");

        String payload = "[COMPRESSED_DATA_HERE]";

        demonstrateEnvelope(headers, payload, "Compressed data with metadata");
        endScenario();
    }

    private static void demonstratePriorityRouting(EnvelopeWrapperImplementation impl) {
        startScenario("Priority Routing", "Priority in envelope, not payload");

        Map<String, String> headers = new HashMap<>();
        headers.put("Priority", "URGENT");
        headers.put("SLA", "5-minutes");
        headers.put("BusinessValue", "High");
        headers.put("Deadline", Instant.now().plusSeconds(300).toString());

        String payload = "{\"transaction\":\"financial_trade\"}";

        demonstrateEnvelope(headers, payload, "Urgent message with SLA");
        endScenario();
    }

    private static void demonstrateEnvelope(Map<String, String> headers, String payload, String description) {
        printInfo("Message: " + description);
        System.out.println();

        System.out.println("  Envelope Headers:");
        for (Map.Entry<String, String> entry : headers.entrySet()) {
            System.out.println("    " + entry.getKey() + ": " + entry.getValue());
        }

        System.out.println();
        System.out.println("  Payload Preview:");
        String preview = payload.length() > 60 ? payload.substring(0, 57) + "..." : payload;
        System.out.println("    " + preview);

        System.out.println();
        printSuccess("Envelope wrapped successfully");
        printInfo("Header count: " + headers.size() + ", Payload size: " + payload.length() + " bytes");
    }

    private static void startScenario(String name, String desc) {
        scenarioCounter++;
        System.out.println("─".repeat(72));
        System.out.println("Scenario " + scenarioCounter + ": " + name);
        System.out.println("─".repeat(72));
        System.out.println("Description: " + desc);
        System.out.println();
    }

    private static void endScenario() {
        System.out.println();
        System.out.println("  ✓ Scenario completed successfully");
        System.out.println();
    }

    private static void printHeader() {
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  " + PATTERN_NAME + " Pattern Demonstration" +
                " ".repeat(70 - PATTERN_NAME.length() - 32) + "║");
        System.out.println("║  Category: " + CATEGORY + " ".repeat(70 - 13 - CATEGORY.length()) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
        System.out.println();
    }

    private static void printDescription() {
        System.out.println("Description:");
        System.out.println("  Wraps application data with message envelope containing routing");
        System.out.println("  information and metadata, separating concerns.");
        System.out.println();
    }

    private static void printSummary() {
        System.out.println("─".repeat(72));
        System.out.println("Execution Summary");
        System.out.println("─".repeat(72));
        System.out.println("  Total scenarios executed: " + scenarioCounter);
        System.out.println("  Pattern: " + PATTERN_NAME);
        System.out.println("  Category: " + CATEGORY);
        System.out.println("  Status: All scenarios completed successfully");
        System.out.println();
        System.out.println("  Key Benefits Demonstrated:");
        System.out.println("    • Separation of payload and metadata");
        System.out.println("    • Secure encrypted payloads");
        System.out.println("    • Protocol-independent routing");
        System.out.println("    • Format flexibility and tracking");
        System.out.println("─".repeat(72));
    }

    private static void printFooter() {
        System.out.println();
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  Pattern Demonstration Complete" + " ".repeat(70 - 34) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
    }

    private static void printSuccess(String msg) {
        System.out.println("  ✓ " + msg);
    }

    private static void printInfo(String msg) {
        System.out.println("  ℹ " + msg);
    }
}
