package Integration.ContentEnricher;

import java.util.*;
import java.time.Instant;
import java.time.Duration;
import java.util.concurrent.*;
import java.util.stream.Collectors;

/**
 * ContentEnricher Pattern - Enterprise Integration Pattern
 *
 * <p>Category: Message Transformation
 *
 * <p><b>Intent:</b> Adds missing data to a message by accessing external data sources,
 * enriching incomplete messages with additional contextual information needed for processing.
 *
 * <p><b>Key Concepts:</b>
 * <ul>
 *   <li>Enriches incomplete messages with additional data</li>
 *   <li>Queries external systems and databases</li>
 *   <li>Adds contextual and reference information</li>
 *   <li>Maintains message flow while enriching</li>
 *   <li>Supports caching for performance</li>
 * </ul>
 *
 * <p><b>When to Use:</b>
 * <ul>
 *   <li>Messages contain IDs but recipients need full details</li>
 *   <li>You need to add data from external systems</li>
 *   <li>Recipients require more context than sender provides</li>
 *   <li>You want to reduce message size but need full data later</li>
 *   <li>Multiple sources must be combined into single message</li>
 * </ul>
 *
 * <p><b>Benefits:</b>
 * <ul>
 *   <li>Decouples message senders from enrichment logic</li>
 *   <li>Reduces initial message size</li>
 *   <li>Centralizes data enrichment logic</li>
 *   <li>Supports caching for better performance</li>
 *   <li>Enables flexible data composition</li>
 * </ul>
 *
 * <p><b>Real-World Scenarios:</b>
 * <ol>
 *   <li>Customer enrichment: Add full customer details to order (ID → full profile)</li>
 *   <li>Product enrichment: Add product details to shopping cart items</li>
 *   <li>Geo enrichment: Add location data to IP addresses</li>
 *   <li>Price enrichment: Add current pricing to product references</li>
 *   <li>Status enrichment: Add real-time status to tracking numbers</li>
 *   <li>User enrichment: Add user profile data to activity logs</li>
 *   <li>Inventory enrichment: Add stock levels to product IDs</li>
 *   <li>Credit enrichment: Add credit scores to loan applications</li>
 *   <li>Weather enrichment: Add forecast data to location events</li>
 *   <li>Social enrichment: Add social media data to contacts</li>
 * </ol>
 *
 * <p><b>Reference:</b> Enterprise Integration Patterns by Gregor Hohpe and Bobby Woolf
 * <br>https://www.enterpriseintegrationpatterns.com/patterns/messaging/DataEnricher.html
 *
 * @author Enterprise Integration Patterns
 * @version 2.0
 * @since 1.0
 */
public class Main {

    private static final String PATTERN_NAME = "ContentEnricher";
    private static final String CATEGORY = "Message Transformation";
    private static int scenarioCounter = 0;

    // Simulated data stores
    private static final Map<String, Map<String, Object>> customerDB = new ConcurrentHashMap<>();
    private static final Map<String, Map<String, Object>> productDB = new ConcurrentHashMap<>();
    private static final Map<String, Map<String, Object>> geoDataDB = new ConcurrentHashMap<>();

    public static void main(String[] args) {
        printHeader();
        printDescription();

        initializeDataStores();
        ContentEnricherImplementation implementation = initializeInfrastructure();
        executeAllScenarios(implementation);
        printSummary();
        printFooter();
    }

    private static void initializeDataStores() {
        // Seed customer data
        Map<String, Object> customer1 = new HashMap<>();
        customer1.put("name", "John Doe");
        customer1.put("email", "john@example.com");
        customer1.put("tier", "Gold");
        customer1.put("creditScore", 750);
        customerDB.put("CUST-1001", customer1);

        // Seed product data
        Map<String, Object> product1 = new HashMap<>();
        product1.put("name", "Laptop Pro");
        product1.put("price", 1299.99);
        product1.put("category", "Electronics");
        product1.put("stock", 45);
        productDB.put("PROD-5001", product1);

        // Seed geo data
        Map<String, Object> geo1 = new HashMap<>();
        geo1.put("city", "San Francisco");
        geo1.put("state", "CA");
        geo1.put("country", "USA");
        geo1.put("timezone", "PST");
        geoDataDB.put("192.168.1.1", geo1);
    }

    private static ContentEnricherImplementation initializeInfrastructure() {
        System.out.println("Initializing " + PATTERN_NAME + " infrastructure...");
        ContentEnricherImplementation implementation = new ContentEnricherImplementation();
        System.out.println("  ✓ Content enricher initialized");
        System.out.println("  ✓ Data source connectors configured");
        System.out.println("  ✓ Enrichment cache enabled");
        System.out.println("  ✓ Fallback handlers installed");
        System.out.println();
        return implementation;
    }

    private static void executeAllScenarios(ContentEnricherImplementation implementation) {
        demonstrateCustomerEnrichment(implementation);
        demonstrateProductEnrichment(implementation);
        demonstrateGeoEnrichment(implementation);
        demonstratePriceEnrichment(implementation);
        demonstrateStatusEnrichment(implementation);
        demonstrateUserEnrichment(implementation);
        demonstrateInventoryEnrichment(implementation);
        demonstrateCreditEnrichment(implementation);
        demonstrateWeatherEnrichment(implementation);
        demonstrateSocialEnrichment(implementation);
    }

    private static void demonstrateCustomerEnrichment(ContentEnricherImplementation impl) {
        startScenario("Customer Enrichment", "Add customer details to order");

        Map<String, Object> order = new HashMap<>();
        order.put("orderId", "ORD-" + System.currentTimeMillis());
        order.put("customerId", "CUST-1001");
        order.put("total", 299.99);

        printInfo("Original message: Order ID with customer reference only");
        System.out.println("  Before: " + order);
        System.out.println();

        // Enrich
        Map<String, Object> customerData = customerDB.get(order.get("customerId"));
        order.putAll(customerData);

        printSuccess("Enriched with customer data from database");
        System.out.println("  After: " + order);
        printInfo("Added: name, email, tier, creditScore");

        endScenario();
    }

    private static void demonstrateProductEnrichment(ContentEnricherImplementation impl) {
        startScenario("Product Enrichment", "Add product details to cart items");

        Map<String, Object> cartItem = new HashMap<>();
        cartItem.put("productId", "PROD-5001");
        cartItem.put("quantity", 2);

        printInfo("Original message: Product ID and quantity only");
        System.out.println("  Before: " + cartItem);
        System.out.println();

        // Enrich
        Map<String, Object> productData = productDB.get(cartItem.get("productId"));
        cartItem.putAll(productData);

        printSuccess("Enriched with product catalog data");
        System.out.println("  After: " + cartItem);
        printInfo("Added: name, price, category, stock");

        endScenario();
    }

    private static void demonstrateGeoEnrichment(ContentEnricherImplementation impl) {
        startScenario("Geo Enrichment", "Add location data to IP address");

        Map<String, Object> event = new HashMap<>();
        event.put("eventId", "EVT-" + System.currentTimeMillis());
        event.put("ipAddress", "192.168.1.1");
        event.put("action", "login");

        printInfo("Original message: Event with IP address only");
        System.out.println("  Before: " + event);
        System.out.println();

        // Enrich
        Map<String, Object> geoData = geoDataDB.get(event.get("ipAddress"));
        event.putAll(geoData);

        printSuccess("Enriched with geographic data");
        System.out.println("  After: " + event);
        printInfo("Added: city, state, country, timezone");

        endScenario();
    }

    private static void demonstratePriceEnrichment(ContentEnricherImplementation impl) {
        startScenario("Price Enrichment", "Add current pricing to product");

        Map<String, Object> quote = new HashMap<>();
        quote.put("quoteId", "QTE-" + System.currentTimeMillis());
        quote.put("productId", "WIDGET-100");

        printInfo("Original message: Quote request with product ID");
        System.out.println("  Before: " + quote);
        System.out.println();

        // Enrich
        quote.put("basePrice", 49.99);
        quote.put("discount", 0.10);
        quote.put("finalPrice", 44.99);
        quote.put("currency", "USD");
        quote.put("validUntil", Instant.now().plusSeconds(3600).toString());

        printSuccess("Enriched with pricing data from pricing service");
        System.out.println("  After: " + quote);
        printInfo("Added: basePrice, discount, finalPrice, currency, validUntil");

        endScenario();
    }

    private static void demonstrateStatusEnrichment(ContentEnricherImplementation impl) {
        startScenario("Status Enrichment", "Add real-time status to tracking");

        Map<String, Object> shipment = new HashMap<>();
        shipment.put("trackingNumber", "1Z999AA10123456784");

        printInfo("Original message: Tracking number only");
        System.out.println("  Before: " + shipment);
        System.out.println();

        // Enrich
        shipment.put("status", "In Transit");
        shipment.put("location", "Chicago, IL");
        shipment.put("estimatedDelivery", "2024-12-20");
        shipment.put("lastUpdate", Instant.now().toString());

        printSuccess("Enriched with carrier tracking data");
        System.out.println("  After: " + shipment);
        printInfo("Added: status, location, estimatedDelivery, lastUpdate");

        endScenario();
    }

    private static void demonstrateUserEnrichment(ContentEnricherImplementation impl) {
        startScenario("User Enrichment", "Add user profile to activity log");

        Map<String, Object> activity = new HashMap<>();
        activity.put("userId", "USER-789");
        activity.put("action", "file_upload");
        activity.put("timestamp", Instant.now().toString());

        printInfo("Original message: Activity log with user ID");
        System.out.println("  Before: " + activity);
        System.out.println();

        // Enrich
        activity.put("username", "alice.smith");
        activity.put("department", "Engineering");
        activity.put("role", "Senior Developer");
        activity.put("permissions", Arrays.asList("read", "write", "delete"));

        printSuccess("Enriched with user profile data");
        System.out.println("  After: " + activity);
        printInfo("Added: username, department, role, permissions");

        endScenario();
    }

    private static void demonstrateInventoryEnrichment(ContentEnricherImplementation impl) {
        startScenario("Inventory Enrichment", "Add stock levels to product");

        Map<String, Object> request = new HashMap<>();
        request.put("sku", "SKU-12345");
        request.put("requestedQty", 10);

        printInfo("Original message: SKU and requested quantity");
        System.out.println("  Before: " + request);
        System.out.println();

        // Enrich
        request.put("availableQty", 45);
        request.put("warehouse", "East Coast");
        request.put("leadTime", "2 days");
        request.put("canFulfill", true);

        printSuccess("Enriched with inventory system data");
        System.out.println("  After: " + request);
        printInfo("Added: availableQty, warehouse, leadTime, canFulfill");

        endScenario();
    }

    private static void demonstrateCreditEnrichment(ContentEnricherImplementation impl) {
        startScenario("Credit Enrichment", "Add credit score to application");

        Map<String, Object> application = new HashMap<>();
        application.put("applicationId", "APP-" + System.currentTimeMillis());
        application.put("applicantId", "APPL-5678");
        application.put("requestedAmount", 25000);

        printInfo("Original message: Loan application with applicant ID");
        System.out.println("  Before: " + application);
        System.out.println();

        // Enrich
        application.put("creditScore", 720);
        application.put("creditHistory", "Good");
        application.put("debtToIncome", 0.35);
        application.put("riskLevel", "Low");

        printSuccess("Enriched with credit bureau data");
        System.out.println("  After: " + application);
        printInfo("Added: creditScore, creditHistory, debtToIncome, riskLevel");

        endScenario();
    }

    private static void demonstrateWeatherEnrichment(ContentEnricherImplementation impl) {
        startScenario("Weather Enrichment", "Add forecast to location event");

        Map<String, Object> event = new HashMap<>();
        event.put("eventId", "OUTDOOR-" + System.currentTimeMillis());
        event.put("location", "Central Park, NY");
        event.put("date", "2024-12-25");

        printInfo("Original message: Outdoor event with location");
        System.out.println("  Before: " + event);
        System.out.println();

        // Enrich
        event.put("temperature", 45.5);
        event.put("conditions", "Partly Cloudy");
        event.put("precipitation", 0.10);
        event.put("windSpeed", 12);

        printSuccess("Enriched with weather service data");
        System.out.println("  After: " + event);
        printInfo("Added: temperature, conditions, precipitation, windSpeed");

        endScenario();
    }

    private static void demonstrateSocialEnrichment(ContentEnricherImplementation impl) {
        startScenario("Social Enrichment", "Add social media data to contact");

        Map<String, Object> contact = new HashMap<>();
        contact.put("contactId", "CNT-" + System.currentTimeMillis());
        contact.put("email", "john.doe@example.com");

        printInfo("Original message: Contact with email only");
        System.out.println("  Before: " + contact);
        System.out.println();

        // Enrich
        contact.put("linkedIn", "linkedin.com/in/johndoe");
        contact.put("twitter", "@johndoe");
        contact.put("company", "TechCorp Inc");
        contact.put("jobTitle", "VP of Engineering");
        contact.put("connections", 500);

        printSuccess("Enriched with social media data");
        System.out.println("  After: " + contact);
        printInfo("Added: linkedIn, twitter, company, jobTitle, connections");

        endScenario();
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
        System.out.println("  Adds missing data to messages by accessing external data sources,");
        System.out.println("  enriching incomplete messages with contextual information.");
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
        System.out.println("    • External data source integration");
        System.out.println("    • Automatic message enrichment");
        System.out.println("    • Reduced initial message size");
        System.out.println("    • Centralized enrichment logic");
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
