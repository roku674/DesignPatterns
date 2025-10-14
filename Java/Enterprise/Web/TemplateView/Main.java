package Enterprise.Web.TemplateView;

import java.util.*;
import java.text.SimpleDateFormat;

/**
 * Template View Pattern Implementation
 *
 * Purpose:
 * Renders information into HTML by embedding markers in an HTML page that are
 * replaced with actual data at runtime. Templates separate presentation logic
 * from business logic.
 *
 * Benefits:
 * - Clean separation between HTML structure and data
 * - Easy for designers to work with templates
 * - Reusable templates across different contexts
 * - Simple conditional and loop constructs
 *
 * This implementation demonstrates:
 * 1. Basic template rendering with variable substitution
 * 2. Product listing page with loops
 * 3. User profile page with conditionals
 * 4. Email templates for notifications
 * 5. Invoice generation with complex formatting
 * 6. Blog post rendering with comments
 * 7. Dashboard with charts and statistics
 * 8. Multi-language template rendering
 * 9. Nested template includes
 * 10. Custom template helpers and filters
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("=== Template View Pattern Demo ===\n");

        // Initialize template engine
        TemplateEngine engine = new TemplateEngine();

        // Scenario 1: Basic Variable Substitution
        demonstrateBasicSubstitution(engine);

        // Scenario 2: Product Listing with Loops
        demonstrateProductListing(engine);

        // Scenario 3: User Profile with Conditionals
        demonstrateUserProfile(engine);

        // Scenario 4: Email Notifications
        demonstrateEmailTemplates(engine);

        // Scenario 5: Invoice Generation
        demonstrateInvoiceGeneration(engine);

        // Scenario 6: Blog Post with Comments
        demonstrateBlogPost(engine);

        // Scenario 7: Dashboard with Statistics
        demonstrateDashboard(engine);

        // Scenario 8: Multi-language Templates
        demonstrateMultiLanguage(engine);

        // Scenario 9: Nested Template Includes
        demonstrateNestedTemplates(engine);

        // Scenario 10: Custom Helpers and Filters
        demonstrateCustomHelpers(engine);
    }

    /**
     * Scenario 1: Basic Variable Substitution
     */
    private static void demonstrateBasicSubstitution(TemplateEngine engine) {
        System.out.println("\n--- Scenario 1: Basic Variable Substitution ---");

        String template = "<html>\n" +
            "<head><title>{{title}}</title></head>\n" +
            "<body>\n" +
            "  <h1>{{heading}}</h1>\n" +
            "  <p>{{message}}</p>\n" +
            "</body>\n" +
            "</html>";

        Map<String, Object> data = new HashMap<>();
        data.put("title", "Welcome Page");
        data.put("heading", "Hello, World!");
        data.put("message", "This is a simple template example.");

        String result = engine.render(template, data);
        System.out.println(result);
    }

    /**
     * Scenario 2: Product Listing with Loops
     */
    private static void demonstrateProductListing(TemplateEngine engine) {
        System.out.println("\n--- Scenario 2: Product Listing with Loops ---");

        String template = "<html>\n" +
            "<head><title>{{storeName}} - Products</title></head>\n" +
            "<body>\n" +
            "  <h1>{{storeName}} Product Catalog</h1>\n" +
            "  <div class='products'>\n" +
            "    {{#each products}}\n" +
            "    <div class='product'>\n" +
            "      <h3>{{name}}</h3>\n" +
            "      <p>Category: {{category}}</p>\n" +
            "      <p class='price'>${{price}}</p>\n" +
            "      <p>Stock: {{stock}}</p>\n" +
            "    </div>\n" +
            "    {{/each}}\n" +
            "  </div>\n" +
            "</body>\n" +
            "</html>";

        Map<String, Object> data = new HashMap<>();
        data.put("storeName", "Tech Store");

        List<Map<String, Object>> products = new ArrayList<>();
        products.add(createProduct("Laptop", "Electronics", 999.99, 15));
        products.add(createProduct("Mouse", "Accessories", 29.99, 50));
        products.add(createProduct("Keyboard", "Accessories", 79.99, 30));
        data.put("products", products);

        String result = engine.render(template, data);
        System.out.println(result);
    }

    /**
     * Scenario 3: User Profile with Conditionals
     */
    private static void demonstrateUserProfile(TemplateEngine engine) {
        System.out.println("\n--- Scenario 3: User Profile with Conditionals ---");

        String template = "<html>\n" +
            "<head><title>User Profile - {{username}}</title></head>\n" +
            "<body>\n" +
            "  <h1>{{fullName}}</h1>\n" +
            "  <p>Email: {{email}}</p>\n" +
            "  {{#if isPremium}}\n" +
            "  <div class='badge premium'>Premium Member</div>\n" +
            "  {{/if}}\n" +
            "  {{#if isAdmin}}\n" +
            "  <div class='badge admin'>Administrator</div>\n" +
            "  {{/if}}\n" +
            "  {{#unless verified}}\n" +
            "  <div class='warning'>Please verify your email</div>\n" +
            "  {{/unless}}\n" +
            "  <p>Member since: {{joinDate}}</p>\n" +
            "</body>\n" +
            "</html>";

        Map<String, Object> data = new HashMap<>();
        data.put("username", "johndoe");
        data.put("fullName", "John Doe");
        data.put("email", "john@example.com");
        data.put("isPremium", true);
        data.put("isAdmin", false);
        data.put("verified", false);
        data.put("joinDate", "2024-01-15");

        String result = engine.render(template, data);
        System.out.println(result);
    }

    /**
     * Scenario 4: Email Notifications
     */
    private static void demonstrateEmailTemplates(TemplateEngine engine) {
        System.out.println("\n--- Scenario 4: Email Notifications ---");

        // Order confirmation email
        String orderTemplate = "Subject: Order Confirmation #{{orderId}}\n\n" +
            "Dear {{customerName}},\n\n" +
            "Thank you for your order! Your order #{{orderId}} has been confirmed.\n\n" +
            "Order Details:\n" +
            "{{#each items}}\n" +
            "- {{name}} x{{quantity}} - ${{price}}\n" +
            "{{/each}}\n\n" +
            "Total: ${{total}}\n" +
            "Shipping to: {{shippingAddress}}\n\n" +
            "Estimated delivery: {{deliveryDate}}\n\n" +
            "Best regards,\n" +
            "The {{storeName}} Team";

        Map<String, Object> data = new HashMap<>();
        data.put("orderId", "12345");
        data.put("customerName", "Jane Smith");
        data.put("storeName", "Tech Store");
        data.put("total", "1109.97");
        data.put("shippingAddress", "123 Main St, City, State 12345");
        data.put("deliveryDate", "2024-10-20");

        List<Map<String, Object>> items = new ArrayList<>();
        items.add(createOrderItem("Laptop", 1, "999.99"));
        items.add(createOrderItem("Mouse", 2, "29.99"));
        items.add(createOrderItem("Keyboard", 1, "79.99"));
        data.put("items", items);

        String result = engine.render(orderTemplate, data);
        System.out.println(result);

        // Welcome email
        System.out.println("\n-- Welcome Email --");
        String welcomeTemplate = "Subject: Welcome to {{siteName}}!\n\n" +
            "Hi {{firstName}},\n\n" +
            "Welcome to {{siteName}}! We're excited to have you on board.\n\n" +
            "Your account has been created with the email: {{email}}\n\n" +
            "{{#if verificationRequired}}\n" +
            "Please verify your email by clicking the link below:\n" +
            "{{verificationLink}}\n\n" +
            "{{/if}}" +
            "Get started by exploring our features!\n\n" +
            "Cheers,\n" +
            "The {{siteName}} Team";

        Map<String, Object> welcomeData = new HashMap<>();
        welcomeData.put("siteName", "TechStore");
        welcomeData.put("firstName", "John");
        welcomeData.put("email", "john@example.com");
        welcomeData.put("verificationRequired", true);
        welcomeData.put("verificationLink", "https://techstore.com/verify?token=abc123");

        result = engine.render(welcomeTemplate, welcomeData);
        System.out.println(result);
    }

    /**
     * Scenario 5: Invoice Generation
     */
    private static void demonstrateInvoiceGeneration(TemplateEngine engine) {
        System.out.println("\n--- Scenario 5: Invoice Generation ---");

        String template = "<html>\n" +
            "<head><title>Invoice #{{invoiceNumber}}</title></head>\n" +
            "<body>\n" +
            "  <div class='invoice'>\n" +
            "    <h1>INVOICE</h1>\n" +
            "    <div class='header'>\n" +
            "      <div>Invoice #{{invoiceNumber}}</div>\n" +
            "      <div>Date: {{invoiceDate}}</div>\n" +
            "      <div>Due Date: {{dueDate}}</div>\n" +
            "    </div>\n" +
            "    <div class='parties'>\n" +
            "      <div class='from'>\n" +
            "        <h3>From:</h3>\n" +
            "        <p>{{companyName}}</p>\n" +
            "        <p>{{companyAddress}}</p>\n" +
            "      </div>\n" +
            "      <div class='to'>\n" +
            "        <h3>Bill To:</h3>\n" +
            "        <p>{{clientName}}</p>\n" +
            "        <p>{{clientAddress}}</p>\n" +
            "      </div>\n" +
            "    </div>\n" +
            "    <table class='items'>\n" +
            "      <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>\n" +
            "      {{#each items}}\n" +
            "      <tr>\n" +
            "        <td>{{description}}</td>\n" +
            "        <td>{{quantity}}</td>\n" +
            "        <td>${{rate}}</td>\n" +
            "        <td>${{amount}}</td>\n" +
            "      </tr>\n" +
            "      {{/each}}\n" +
            "    </table>\n" +
            "    <div class='totals'>\n" +
            "      <div>Subtotal: ${{subtotal}}</div>\n" +
            "      <div>Tax ({{taxRate}}%): ${{taxAmount}}</div>\n" +
            "      <div class='total'>Total: ${{total}}</div>\n" +
            "    </div>\n" +
            "    <div class='notes'>\n" +
            "      <p>{{paymentTerms}}</p>\n" +
            "      <p>{{notes}}</p>\n" +
            "    </div>\n" +
            "  </div>\n" +
            "</body>\n" +
            "</html>";

        Map<String, Object> data = new HashMap<>();
        data.put("invoiceNumber", "INV-2024-001");
        data.put("invoiceDate", "2024-10-14");
        data.put("dueDate", "2024-11-14");
        data.put("companyName", "TechStore Inc.");
        data.put("companyAddress", "456 Business Ave, Suite 100, City, State 12345");
        data.put("clientName", "Acme Corporation");
        data.put("clientAddress", "789 Client St, Town, State 67890");
        data.put("subtotal", "2500.00");
        data.put("taxRate", "8.5");
        data.put("taxAmount", "212.50");
        data.put("total", "2712.50");
        data.put("paymentTerms", "Payment due within 30 days");
        data.put("notes", "Thank you for your business!");

        List<Map<String, Object>> items = new ArrayList<>();
        items.add(createInvoiceItem("Web Development Services", 40, "50.00", "2000.00"));
        items.add(createInvoiceItem("Design Consultation", 5, "100.00", "500.00"));
        data.put("items", items);

        String result = engine.render(template, data);
        System.out.println(result);
    }

    /**
     * Scenario 6: Blog Post with Comments
     */
    private static void demonstrateBlogPost(TemplateEngine engine) {
        System.out.println("\n--- Scenario 6: Blog Post with Comments ---");

        String template = "<html>\n" +
            "<head><title>{{title}}</title></head>\n" +
            "<body>\n" +
            "  <article>\n" +
            "    <h1>{{title}}</h1>\n" +
            "    <div class='meta'>\n" +
            "      <span>By {{author}}</span>\n" +
            "      <span>Posted on {{publishDate}}</span>\n" +
            "      <span>{{category}}</span>\n" +
            "    </div>\n" +
            "    <div class='content'>{{content}}</div>\n" +
            "    {{#each tags}}\n" +
            "    <span class='tag'>{{this}}</span>\n" +
            "    {{/each}}\n" +
            "  </article>\n" +
            "  <div class='comments'>\n" +
            "    <h2>Comments ({{commentCount}})</h2>\n" +
            "    {{#each comments}}\n" +
            "    <div class='comment'>\n" +
            "      <div class='author'>{{author}}</div>\n" +
            "      <div class='date'>{{date}}</div>\n" +
            "      <div class='text'>{{text}}</div>\n" +
            "    </div>\n" +
            "    {{/each}}\n" +
            "  </div>\n" +
            "</body>\n" +
            "</html>";

        Map<String, Object> data = new HashMap<>();
        data.put("title", "Understanding Design Patterns");
        data.put("author", "John Developer");
        data.put("publishDate", "2024-10-14");
        data.put("category", "Programming");
        data.put("content", "Design patterns are reusable solutions to common problems...");
        data.put("tags", Arrays.asList("patterns", "software", "architecture"));
        data.put("commentCount", "2");

        List<Map<String, Object>> comments = new ArrayList<>();
        comments.add(createComment("Alice", "2024-10-14", "Great article!"));
        comments.add(createComment("Bob", "2024-10-14", "Very informative, thanks!"));
        data.put("comments", comments);

        String result = engine.render(template, data);
        System.out.println(result);
    }

    /**
     * Scenario 7: Dashboard with Statistics
     */
    private static void demonstrateDashboard(TemplateEngine engine) {
        System.out.println("\n--- Scenario 7: Dashboard with Statistics ---");

        String template = "<html>\n" +
            "<head><title>Admin Dashboard</title></head>\n" +
            "<body>\n" +
            "  <h1>Dashboard Overview</h1>\n" +
            "  <div class='stats'>\n" +
            "    <div class='stat-card'>\n" +
            "      <h3>Total Sales</h3>\n" +
            "      <p class='number'>${{totalSales}}</p>\n" +
            "      <p class='change {{salesTrend}}'>{{salesChange}}%</p>\n" +
            "    </div>\n" +
            "    <div class='stat-card'>\n" +
            "      <h3>New Users</h3>\n" +
            "      <p class='number'>{{newUsers}}</p>\n" +
            "      <p class='change {{usersTrend}}'>{{usersChange}}%</p>\n" +
            "    </div>\n" +
            "    <div class='stat-card'>\n" +
            "      <h3>Orders</h3>\n" +
            "      <p class='number'>{{totalOrders}}</p>\n" +
            "      <p class='change {{ordersTrend}}'>{{ordersChange}}%</p>\n" +
            "    </div>\n" +
            "  </div>\n" +
            "  <div class='recent-orders'>\n" +
            "    <h2>Recent Orders</h2>\n" +
            "    <table>\n" +
            "      <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr>\n" +
            "      {{#each recentOrders}}\n" +
            "      <tr>\n" +
            "        <td>{{orderId}}</td>\n" +
            "        <td>{{customer}}</td>\n" +
            "        <td>${{amount}}</td>\n" +
            "        <td class='status-{{status}}'>{{status}}</td>\n" +
            "      </tr>\n" +
            "      {{/each}}\n" +
            "    </table>\n" +
            "  </div>\n" +
            "  <div class='alerts'>\n" +
            "    {{#each alerts}}\n" +
            "    <div class='alert alert-{{type}}'>\n" +
            "      <strong>{{title}}</strong>: {{message}}\n" +
            "    </div>\n" +
            "    {{/each}}\n" +
            "  </div>\n" +
            "</body>\n" +
            "</html>";

        Map<String, Object> data = new HashMap<>();
        data.put("totalSales", "125,430.50");
        data.put("salesChange", "+12.5");
        data.put("salesTrend", "up");
        data.put("newUsers", "1,234");
        data.put("usersChange", "+8.3");
        data.put("usersTrend", "up");
        data.put("totalOrders", "456");
        data.put("ordersChange", "-2.1");
        data.put("ordersTrend", "down");

        List<Map<String, Object>> orders = new ArrayList<>();
        orders.add(createDashboardOrder("12345", "John Doe", "299.99", "completed"));
        orders.add(createDashboardOrder("12346", "Jane Smith", "1109.97", "pending"));
        orders.add(createDashboardOrder("12347", "Bob Johnson", "49.99", "shipped"));
        data.put("recentOrders", orders);

        List<Map<String, Object>> alerts = new ArrayList<>();
        alerts.add(createAlert("warning", "Low Stock", "5 products are running low on stock"));
        alerts.add(createAlert("info", "System Update", "Scheduled maintenance on Sunday"));
        data.put("alerts", alerts);

        String result = engine.render(template, data);
        System.out.println(result);
    }

    /**
     * Scenario 8: Multi-language Templates
     */
    private static void demonstrateMultiLanguage(TemplateEngine engine) {
        System.out.println("\n--- Scenario 8: Multi-language Templates ---");

        String template = "<html>\n" +
            "<head><title>{{t.title}}</title></head>\n" +
            "<body>\n" +
            "  <h1>{{t.welcome}}</h1>\n" +
            "  <nav>\n" +
            "    <a href='/'>{{t.home}}</a>\n" +
            "    <a href='/products'>{{t.products}}</a>\n" +
            "    <a href='/about'>{{t.about}}</a>\n" +
            "    <a href='/contact'>{{t.contact}}</a>\n" +
            "  </nav>\n" +
            "  <div class='content'>\n" +
            "    <p>{{t.description}}</p>\n" +
            "  </div>\n" +
            "</body>\n" +
            "</html>";

        // English version
        System.out.println("-- English Version --");
        Map<String, Object> enData = new HashMap<>();
        Map<String, String> enTranslations = new HashMap<>();
        enTranslations.put("title", "Welcome");
        enTranslations.put("welcome", "Welcome to Our Store");
        enTranslations.put("home", "Home");
        enTranslations.put("products", "Products");
        enTranslations.put("about", "About Us");
        enTranslations.put("contact", "Contact");
        enTranslations.put("description", "Discover our amazing products!");
        enData.put("t", enTranslations);
        System.out.println(engine.render(template, enData));

        // Spanish version
        System.out.println("\n-- Spanish Version --");
        Map<String, Object> esData = new HashMap<>();
        Map<String, String> esTranslations = new HashMap<>();
        esTranslations.put("title", "Bienvenido");
        esTranslations.put("welcome", "Bienvenido a Nuestra Tienda");
        esTranslations.put("home", "Inicio");
        esTranslations.put("products", "Productos");
        esTranslations.put("about", "Acerca de");
        esTranslations.put("contact", "Contacto");
        esTranslations.put("description", "¡Descubre nuestros increíbles productos!");
        esData.put("t", esTranslations);
        System.out.println(engine.render(template, esData));
    }

    /**
     * Scenario 9: Nested Template Includes
     */
    private static void demonstrateNestedTemplates(TemplateEngine engine) {
        System.out.println("\n--- Scenario 9: Nested Template Includes ---");

        // Register partial templates
        engine.registerPartial("header", "<header>\n" +
            "  <h1>{{siteName}}</h1>\n" +
            "  <nav>{{navigation}}</nav>\n" +
            "</header>");

        engine.registerPartial("footer", "<footer>\n" +
            "  <p>&copy; {{year}} {{siteName}}. All rights reserved.</p>\n" +
            "</footer>");

        String template = "<html>\n" +
            "<head><title>{{pageTitle}}</title></head>\n" +
            "<body>\n" +
            "  {{> header}}\n" +
            "  <main>\n" +
            "    <h2>{{contentTitle}}</h2>\n" +
            "    <p>{{contentBody}}</p>\n" +
            "  </main>\n" +
            "  {{> footer}}\n" +
            "</body>\n" +
            "</html>";

        Map<String, Object> data = new HashMap<>();
        data.put("siteName", "TechStore");
        data.put("pageTitle", "About Us");
        data.put("navigation", "Home | Products | About | Contact");
        data.put("contentTitle", "About Our Company");
        data.put("contentBody", "We are a leading technology retailer...");
        data.put("year", "2024");

        String result = engine.render(template, data);
        System.out.println(result);
    }

    /**
     * Scenario 10: Custom Helpers and Filters
     */
    private static void demonstrateCustomHelpers(TemplateEngine engine) {
        System.out.println("\n--- Scenario 10: Custom Helpers and Filters ---");

        String template = "<html>\n" +
            "<head><title>Product Details</title></head>\n" +
            "<body>\n" +
            "  <h1>{{uppercase name}}</h1>\n" +
            "  <p>Price: {{currency price}}</p>\n" +
            "  <p>Description: {{truncate description 50}}</p>\n" +
            "  <p>Added: {{formatDate dateAdded}}</p>\n" +
            "  <div class='rating'>{{repeat '★' rating}}{{repeat '☆' (5 - rating)}}</div>\n" +
            "  {{#if (gt stock 0)}}\n" +
            "  <button>Add to Cart</button>\n" +
            "  {{else}}\n" +
            "  <p class='out-of-stock'>Out of Stock</p>\n" +
            "  {{/if}}\n" +
            "</body>\n" +
            "</html>";

        Map<String, Object> data = new HashMap<>();
        data.put("name", "wireless headphones");
        data.put("price", 149.99);
        data.put("description", "High-quality wireless headphones with noise cancellation and premium sound quality for an immersive listening experience.");
        data.put("dateAdded", "2024-10-14");
        data.put("rating", 4);
        data.put("stock", 25);

        String result = engine.render(template, data);
        System.out.println(result);

        // Example with out of stock
        System.out.println("\n-- Out of Stock Example --");
        data.put("stock", 0);
        result = engine.render(template, data);
        System.out.println(result);
    }

    // Helper methods to create data structures
    private static Map<String, Object> createProduct(String name, String category, double price, int stock) {
        Map<String, Object> product = new HashMap<>();
        product.put("name", name);
        product.put("category", category);
        product.put("price", price);
        product.put("stock", stock);
        return product;
    }

    private static Map<String, Object> createOrderItem(String name, int quantity, String price) {
        Map<String, Object> item = new HashMap<>();
        item.put("name", name);
        item.put("quantity", quantity);
        item.put("price", price);
        return item;
    }

    private static Map<String, Object> createInvoiceItem(String description, int quantity, String rate, String amount) {
        Map<String, Object> item = new HashMap<>();
        item.put("description", description);
        item.put("quantity", quantity);
        item.put("rate", rate);
        item.put("amount", amount);
        return item;
    }

    private static Map<String, Object> createComment(String author, String date, String text) {
        Map<String, Object> comment = new HashMap<>();
        comment.put("author", author);
        comment.put("date", date);
        comment.put("text", text);
        return comment;
    }

    private static Map<String, Object> createDashboardOrder(String orderId, String customer, String amount, String status) {
        Map<String, Object> order = new HashMap<>();
        order.put("orderId", orderId);
        order.put("customer", customer);
        order.put("amount", amount);
        order.put("status", status);
        return order;
    }

    private static Map<String, Object> createAlert(String type, String title, String message) {
        Map<String, Object> alert = new HashMap<>();
        alert.put("type", type);
        alert.put("title", title);
        alert.put("message", message);
        return alert;
    }
}

/**
 * Template Engine - Processes templates and replaces markers with data
 */
class TemplateEngine {
    private Map<String, String> partials = new HashMap<>();
    private Map<String, TemplateHelper> helpers = new HashMap<>();

    public TemplateEngine() {
        registerDefaultHelpers();
    }

    /**
     * Register a partial template for reuse
     */
    public void registerPartial(String name, String template) {
        partials.put(name, template);
    }

    /**
     * Register a custom helper function
     */
    public void registerHelper(String name, TemplateHelper helper) {
        helpers.put(name, helper);
    }

    /**
     * Render a template with the provided data
     */
    public String render(String template, Map<String, Object> data) {
        String result = template;

        // Process partials ({{> partialName}})
        result = processPartials(result, data);

        // Process loops ({{#each items}}...{{/each}})
        result = processEach(result, data);

        // Process conditionals ({{#if condition}}...{{/if}})
        result = processConditionals(result, data);

        // Process helpers and filters
        result = processHelpers(result, data);

        // Process simple variable substitution ({{variable}})
        result = processVariables(result, data);

        return result;
    }

    /**
     * Process partial includes
     */
    private String processPartials(String template, Map<String, Object> data) {
        String result = template;
        for (Map.Entry<String, String> entry : partials.entrySet()) {
            String partialName = entry.getKey();
            String partialTemplate = entry.getValue();
            String partialMarker = "{{> " + partialName + "}}";
            if (result.contains(partialMarker)) {
                String renderedPartial = render(partialTemplate, data);
                result = result.replace(partialMarker, renderedPartial);
            }
        }
        return result;
    }

    /**
     * Process each loops
     */
    private String processEach(String template, Map<String, Object> data) {
        String result = template;
        int startIndex = result.indexOf("{{#each ");
        while (startIndex != -1) {
            int endMarker = result.indexOf("}}", startIndex);
            String listName = result.substring(startIndex + 8, endMarker).trim();
            int endIndex = result.indexOf("{{/each}}", endMarker);

            if (endIndex != -1) {
                String loopTemplate = result.substring(endMarker + 2, endIndex).trim();
                StringBuilder loopResult = new StringBuilder();

                Object listObj = getNestedValue(data, listName);
                if (listObj instanceof List) {
                    List<?> list = (List<?>) listObj;
                    for (Object item : list) {
                        if (item instanceof Map) {
                            loopResult.append(processVariables(loopTemplate, (Map<String, Object>) item));
                            loopResult.append("\n");
                        } else {
                            // Handle simple values
                            loopResult.append(loopTemplate.replace("{{this}}", item.toString()));
                            loopResult.append("\n");
                        }
                    }
                }

                result = result.substring(0, startIndex) + loopResult.toString() +
                    result.substring(endIndex + 9);
            }
            startIndex = result.indexOf("{{#each ", startIndex + 1);
        }
        return result;
    }

    /**
     * Process conditional blocks
     */
    private String processConditionals(String template, Map<String, Object> data) {
        String result = template;

        // Process {{#if condition}}...{{/if}}
        result = processIfBlock(result, data, true);

        // Process {{#unless condition}}...{{/unless}}
        result = processIfBlock(result, data, false);

        return result;
    }

    private String processIfBlock(String template, Map<String, Object> data, boolean normalIf) {
        String result = template;
        String startMarker = normalIf ? "{{#if " : "{{#unless ";
        String endMarker = normalIf ? "{{/if}}" : "{{/unless}}";

        int startIndex = result.indexOf(startMarker);
        while (startIndex != -1) {
            int endOfStart = result.indexOf("}}", startIndex);
            String condition = result.substring(startIndex + startMarker.length(), endOfStart).trim();
            int endIndex = result.indexOf(endMarker, endOfStart);

            if (endIndex != -1) {
                String blockContent = result.substring(endOfStart + 2, endIndex).trim();
                boolean conditionValue = evaluateCondition(condition, data);

                if (!normalIf) {
                    conditionValue = !conditionValue;
                }

                String replacement = conditionValue ? processVariables(blockContent, data) : "";
                result = result.substring(0, startIndex) + replacement +
                    result.substring(endIndex + endMarker.length());
            }
            startIndex = result.indexOf(startMarker, startIndex + 1);
        }
        return result;
    }

    /**
     * Evaluate a condition
     */
    private boolean evaluateCondition(String condition, Map<String, Object> data) {
        // Handle helper conditions like (gt stock 0)
        if (condition.startsWith("(") && condition.endsWith(")")) {
            condition = condition.substring(1, condition.length() - 1);
            String[] parts = condition.split(" ");
            if (parts.length >= 3 && parts[0].equals("gt")) {
                Object value = getNestedValue(data, parts[1]);
                int compareValue = Integer.parseInt(parts[2]);
                if (value instanceof Integer) {
                    return (Integer) value > compareValue;
                }
            }
            return false;
        }

        // Simple boolean check
        Object value = getNestedValue(data, condition);
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        return value != null;
    }

    /**
     * Process helper functions
     */
    private String processHelpers(String template, Map<String, Object> data) {
        String result = template;

        // Simple helper pattern: {{helperName param1 param2}}
        int startIndex = result.indexOf("{{");
        while (startIndex != -1 && startIndex < result.length() - 2) {
            int endIndex = result.indexOf("}}", startIndex);
            if (endIndex == -1) break;

            String expression = result.substring(startIndex + 2, endIndex).trim();
            if (!expression.startsWith("#") && !expression.startsWith("/") &&
                !expression.startsWith(">") && expression.contains(" ")) {

                String[] parts = expression.split(" ", 2);
                String helperName = parts[0];

                if (helpers.containsKey(helperName)) {
                    String params = parts.length > 1 ? parts[1] : "";
                    String helperResult = helpers.get(helperName).apply(params, data);
                    result = result.substring(0, startIndex) + helperResult +
                        result.substring(endIndex + 2);
                    startIndex = result.indexOf("{{", startIndex + helperResult.length());
                    continue;
                }
            }
            startIndex = result.indexOf("{{", endIndex);
        }

        return result;
    }

    /**
     * Process simple variable substitution
     */
    private String processVariables(String template, Map<String, Object> data) {
        String result = template;
        int startIndex = result.indexOf("{{");
        while (startIndex != -1 && startIndex < result.length() - 2) {
            int endIndex = result.indexOf("}}", startIndex);
            if (endIndex == -1) break;

            String varName = result.substring(startIndex + 2, endIndex).trim();

            // Skip special markers
            if (varName.startsWith("#") || varName.startsWith("/") ||
                varName.startsWith(">") || varName.contains(" ")) {
                startIndex = result.indexOf("{{", endIndex);
                continue;
            }

            Object value = getNestedValue(data, varName);
            String replacement = value != null ? value.toString() : "";

            result = result.substring(0, startIndex) + replacement + result.substring(endIndex + 2);
            startIndex = result.indexOf("{{", startIndex + replacement.length());
        }
        return result;
    }

    /**
     * Get nested value from data map (e.g., "user.name")
     */
    private Object getNestedValue(Map<String, Object> data, String path) {
        String[] parts = path.split("\\.");
        Object current = data;

        for (String part : parts) {
            if (current instanceof Map) {
                current = ((Map<String, Object>) current).get(part);
            } else {
                return null;
            }
        }
        return current;
    }

    /**
     * Register default helper functions
     */
    private void registerDefaultHelpers() {
        // Uppercase helper
        registerHelper("uppercase", (params, data) -> {
            Object value = getNestedValue(data, params.trim());
            return value != null ? value.toString().toUpperCase() : "";
        });

        // Currency formatter
        registerHelper("currency", (params, data) -> {
            Object value = getNestedValue(data, params.trim());
            if (value instanceof Number) {
                return String.format("$%.2f", ((Number) value).doubleValue());
            }
            return value != null ? value.toString() : "";
        });

        // Truncate text
        registerHelper("truncate", (params, data) -> {
            String[] parts = params.split(" ");
            if (parts.length < 2) return "";
            Object value = getNestedValue(data, parts[0]);
            int length = Integer.parseInt(parts[1]);
            if (value != null) {
                String text = value.toString();
                return text.length() > length ? text.substring(0, length) + "..." : text;
            }
            return "";
        });

        // Format date
        registerHelper("formatDate", (params, data) -> {
            Object value = getNestedValue(data, params.trim());
            if (value != null) {
                SimpleDateFormat sdf = new SimpleDateFormat("MMMM dd, yyyy");
                try {
                    Date date = new SimpleDateFormat("yyyy-MM-dd").parse(value.toString());
                    return sdf.format(date);
                } catch (Exception e) {
                    return value.toString();
                }
            }
            return "";
        });

        // Repeat string
        registerHelper("repeat", (params, data) -> {
            String[] parts = params.split(" ");
            if (parts.length < 2) return "";
            String str = parts[0].replace("'", "");
            int count = Integer.parseInt(parts[1]);
            StringBuilder result = new StringBuilder();
            for (int i = 0; i < count; i++) {
                result.append(str);
            }
            return result.toString();
        });
    }
}

/**
 * Template Helper Interface
 */
interface TemplateHelper {
    String apply(String params, Map<String, Object> data);
}
