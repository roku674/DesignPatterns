package Enterprise.Web.TwoStepView;

import java.util.*;

/**
 * Two Step View Pattern Implementation
 *
 * Purpose:
 * Turns domain data into HTML in two steps: first by forming a logical page,
 * then rendering that logical page into HTML. The first step creates a logical
 * screen structure independent of the actual formatting, while the second step
 * renders it using a particular formatting strategy.
 *
 * Benefits:
 * - Separates logical page structure from physical rendering
 * - Easy to support multiple output formats (HTML, PDF, mobile)
 * - Simplifies global style changes
 * - Enables theme support and skinning
 * - Reuses logical structure across different views
 *
 * This implementation demonstrates:
 * 1. Basic two-step transformation (logical to physical)
 * 2. Multi-theme support (light, dark, high-contrast)
 * 3. Responsive design adaptation (desktop, tablet, mobile)
 * 4. Multi-format output (HTML, PDF, plain text)
 * 5. Accessibility compliance rendering
 * 6. Print-optimized views
 * 7. Email-formatted views
 * 8. Dashboard with different layouts
 * 9. Product catalog with various presentations
 * 10. Report generation with multiple formats
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("=== Two Step View Pattern Demo ===\n");

        TwoStepViewProcessor processor = new TwoStepViewProcessor();

        // Scenario 1: Basic Two-Step Transformation
        demonstrateBasicTransformation(processor);

        // Scenario 2: Multi-Theme Support
        demonstrateMultiTheme(processor);

        // Scenario 3: Responsive Design Adaptation
        demonstrateResponsiveDesign(processor);

        // Scenario 4: Multi-Format Output
        demonstrateMultiFormat(processor);

        // Scenario 5: Accessibility Compliance
        demonstrateAccessibility(processor);

        // Scenario 6: Print-Optimized Views
        demonstratePrintView(processor);

        // Scenario 7: Email-Formatted Views
        demonstrateEmailView(processor);

        // Scenario 8: Dashboard Layouts
        demonstrateDashboardLayouts(processor);

        // Scenario 9: Product Catalog Presentations
        demonstrateProductCatalog(processor);

        // Scenario 10: Report Generation
        demonstrateReportGeneration(processor);
    }

    /**
     * Scenario 1: Basic Two-Step Transformation
     */
    private static void demonstrateBasicTransformation(TwoStepViewProcessor processor) {
        System.out.println("\n--- Scenario 1: Basic Two-Step Transformation ---");

        // Create domain data
        Map<String, Object> data = new HashMap<>();
        data.put("title", "Welcome Page");
        data.put("heading", "Hello World");
        data.put("content", "This is a basic example of two-step view pattern.");

        // Step 1: Create logical screen
        LogicalScreen logicalScreen = processor.createLogicalScreen(data);

        // Step 2: Render to HTML
        String html = processor.renderToHTML(logicalScreen, "default");
        System.out.println(html);
    }

    /**
     * Scenario 2: Multi-Theme Support
     */
    private static void demonstrateMultiTheme(TwoStepViewProcessor processor) {
        System.out.println("\n--- Scenario 2: Multi-Theme Support ---");

        Map<String, Object> data = new HashMap<>();
        data.put("title", "Themed Page");
        data.put("heading", "Multi-Theme Support");
        data.put("content", "Same logical structure, different themes.");

        LogicalScreen logicalScreen = processor.createLogicalScreen(data);

        System.out.println("-- Light Theme --");
        System.out.println(processor.renderToHTML(logicalScreen, "light"));

        System.out.println("\n-- Dark Theme --");
        System.out.println(processor.renderToHTML(logicalScreen, "dark"));

        System.out.println("\n-- High Contrast Theme --");
        System.out.println(processor.renderToHTML(logicalScreen, "high-contrast"));
    }

    /**
     * Scenario 3: Responsive Design Adaptation
     */
    private static void demonstrateResponsiveDesign(TwoStepViewProcessor processor) {
        System.out.println("\n--- Scenario 3: Responsive Design Adaptation ---");

        Map<String, Object> data = new HashMap<>();
        data.put("title", "Responsive Page");
        data.put("heading", "Responsive Design");

        List<Map<String, String>> items = new ArrayList<>();
        items.add(createItem("Item 1", "Description 1"));
        items.add(createItem("Item 2", "Description 2"));
        items.add(createItem("Item 3", "Description 3"));
        data.put("items", items);

        LogicalScreen logicalScreen = processor.createLogicalScreen(data);

        System.out.println("-- Desktop View --");
        System.out.println(processor.renderToDevice(logicalScreen, "desktop"));

        System.out.println("\n-- Tablet View --");
        System.out.println(processor.renderToDevice(logicalScreen, "tablet"));

        System.out.println("\n-- Mobile View --");
        System.out.println(processor.renderToDevice(logicalScreen, "mobile"));
    }

    /**
     * Scenario 4: Multi-Format Output
     */
    private static void demonstrateMultiFormat(TwoStepViewProcessor processor) {
        System.out.println("\n--- Scenario 4: Multi-Format Output ---");

        Map<String, Object> data = new HashMap<>();
        data.put("title", "Sales Report");
        data.put("heading", "Q3 2024 Sales Report");

        List<Map<String, String>> sales = new ArrayList<>();
        sales.add(createSale("Product A", "1000", "50000"));
        sales.add(createSale("Product B", "750", "37500"));
        sales.add(createSale("Product C", "500", "25000"));
        data.put("sales", sales);
        data.put("total", "112500");

        LogicalScreen logicalScreen = processor.createLogicalScreen(data);

        System.out.println("-- HTML Format --");
        System.out.println(processor.renderToHTML(logicalScreen, "default"));

        System.out.println("\n-- PDF Format --");
        System.out.println(processor.renderToPDF(logicalScreen));

        System.out.println("\n-- Plain Text Format --");
        System.out.println(processor.renderToText(logicalScreen));
    }

    /**
     * Scenario 5: Accessibility Compliance
     */
    private static void demonstrateAccessibility(TwoStepViewProcessor processor) {
        System.out.println("\n--- Scenario 5: Accessibility Compliance ---");

        Map<String, Object> data = new HashMap<>();
        data.put("title", "Accessible Page");
        data.put("heading", "Accessibility Features");
        data.put("content", "This page is optimized for screen readers.");

        List<Map<String, String>> sections = new ArrayList<>();
        sections.add(createSection("Introduction", "Welcome to our accessible site"));
        sections.add(createSection("Features", "Full keyboard navigation support"));
        data.put("sections", sections);

        LogicalScreen logicalScreen = processor.createLogicalScreen(data);

        // Render with ARIA attributes and semantic HTML
        String accessibleHTML = processor.renderAccessible(logicalScreen);
        System.out.println(accessibleHTML);
    }

    /**
     * Scenario 6: Print-Optimized Views
     */
    private static void demonstratePrintView(TwoStepViewProcessor processor) {
        System.out.println("\n--- Scenario 6: Print-Optimized Views ---");

        Map<String, Object> data = new HashMap<>();
        data.put("title", "Invoice");
        data.put("heading", "Invoice #12345");

        List<Map<String, String>> items = new ArrayList<>();
        items.add(createInvoiceItem("Service A", "10", "100.00", "1000.00"));
        items.add(createInvoiceItem("Service B", "5", "200.00", "1000.00"));
        data.put("items", items);
        data.put("total", "2000.00");

        LogicalScreen logicalScreen = processor.createLogicalScreen(data);

        String printView = processor.renderForPrint(logicalScreen);
        System.out.println(printView);
    }

    /**
     * Scenario 7: Email-Formatted Views
     */
    private static void demonstrateEmailView(TwoStepViewProcessor processor) {
        System.out.println("\n--- Scenario 7: Email-Formatted Views ---");

        Map<String, Object> data = new HashMap<>();
        data.put("title", "Order Confirmation");
        data.put("recipient", "John Doe");
        data.put("orderId", "12345");

        List<Map<String, String>> orderItems = new ArrayList<>();
        orderItems.add(createOrderItem("Laptop", "1", "999.99"));
        orderItems.add(createOrderItem("Mouse", "2", "29.99"));
        data.put("orderItems", orderItems);
        data.put("total", "1059.97");

        LogicalScreen logicalScreen = processor.createLogicalScreen(data);

        String emailView = processor.renderForEmail(logicalScreen);
        System.out.println(emailView);
    }

    /**
     * Scenario 8: Dashboard Layouts
     */
    private static void demonstrateDashboardLayouts(TwoStepViewProcessor processor) {
        System.out.println("\n--- Scenario 8: Dashboard Layouts ---");

        Map<String, Object> data = new HashMap<>();
        data.put("title", "Admin Dashboard");

        Map<String, String> stats = new HashMap<>();
        stats.put("totalSales", "125430.50");
        stats.put("newUsers", "1234");
        stats.put("totalOrders", "456");
        data.put("stats", stats);

        List<Map<String, String>> recentOrders = new ArrayList<>();
        recentOrders.add(createDashboardOrder("12345", "John Doe", "299.99"));
        recentOrders.add(createDashboardOrder("12346", "Jane Smith", "1109.97"));
        data.put("recentOrders", recentOrders);

        LogicalScreen logicalScreen = processor.createLogicalScreen(data);

        System.out.println("-- Grid Layout --");
        System.out.println(processor.renderDashboard(logicalScreen, "grid"));

        System.out.println("\n-- List Layout --");
        System.out.println(processor.renderDashboard(logicalScreen, "list"));

        System.out.println("\n-- Compact Layout --");
        System.out.println(processor.renderDashboard(logicalScreen, "compact"));
    }

    /**
     * Scenario 9: Product Catalog Presentations
     */
    private static void demonstrateProductCatalog(TwoStepViewProcessor processor) {
        System.out.println("\n--- Scenario 9: Product Catalog Presentations ---");

        Map<String, Object> data = new HashMap<>();
        data.put("title", "Product Catalog");
        data.put("storeName", "TechStore");

        List<Map<String, String>> products = new ArrayList<>();
        products.add(createProduct("Laptop", "Electronics", "999.99", "15"));
        products.add(createProduct("Mouse", "Accessories", "29.99", "50"));
        products.add(createProduct("Keyboard", "Accessories", "79.99", "30"));
        data.put("products", products);

        LogicalScreen logicalScreen = processor.createLogicalScreen(data);

        System.out.println("-- Card Layout --");
        System.out.println(processor.renderProductCatalog(logicalScreen, "card"));

        System.out.println("\n-- Table Layout --");
        System.out.println(processor.renderProductCatalog(logicalScreen, "table"));

        System.out.println("\n-- List Layout --");
        System.out.println(processor.renderProductCatalog(logicalScreen, "list"));
    }

    /**
     * Scenario 10: Report Generation
     */
    private static void demonstrateReportGeneration(TwoStepViewProcessor processor) {
        System.out.println("\n--- Scenario 10: Report Generation ---");

        Map<String, Object> data = new HashMap<>();
        data.put("title", "Monthly Report");
        data.put("reportDate", "October 2024");
        data.put("company", "TechStore Inc.");

        List<Map<String, String>> metrics = new ArrayList<>();
        metrics.add(createMetric("Revenue", "125430.50", "+12.5%"));
        metrics.add(createMetric("Expenses", "45230.20", "+5.2%"));
        metrics.add(createMetric("Profit", "80200.30", "+18.3%"));
        data.put("metrics", metrics);

        LogicalScreen logicalScreen = processor.createLogicalScreen(data);

        System.out.println("-- Executive Summary Format --");
        System.out.println(processor.renderReport(logicalScreen, "executive"));

        System.out.println("\n-- Detailed Format --");
        System.out.println(processor.renderReport(logicalScreen, "detailed"));

        System.out.println("\n-- Presentation Format --");
        System.out.println(processor.renderReport(logicalScreen, "presentation"));
    }

    // Helper methods
    private static Map<String, String> createItem(String name, String description) {
        Map<String, String> item = new HashMap<>();
        item.put("name", name);
        item.put("description", description);
        return item;
    }

    private static Map<String, String> createSale(String product, String quantity, String revenue) {
        Map<String, String> sale = new HashMap<>();
        sale.put("product", product);
        sale.put("quantity", quantity);
        sale.put("revenue", revenue);
        return sale;
    }

    private static Map<String, String> createSection(String title, String content) {
        Map<String, String> section = new HashMap<>();
        section.put("title", title);
        section.put("content", content);
        return section;
    }

    private static Map<String, String> createInvoiceItem(String description, String quantity, String rate, String amount) {
        Map<String, String> item = new HashMap<>();
        item.put("description", description);
        item.put("quantity", quantity);
        item.put("rate", rate);
        item.put("amount", amount);
        return item;
    }

    private static Map<String, String> createOrderItem(String name, String quantity, String price) {
        Map<String, String> item = new HashMap<>();
        item.put("name", name);
        item.put("quantity", quantity);
        item.put("price", price);
        return item;
    }

    private static Map<String, String> createDashboardOrder(String orderId, String customer, String amount) {
        Map<String, String> order = new HashMap<>();
        order.put("orderId", orderId);
        order.put("customer", customer);
        order.put("amount", amount);
        return order;
    }

    private static Map<String, String> createProduct(String name, String category, String price, String stock) {
        Map<String, String> product = new HashMap<>();
        product.put("name", name);
        product.put("category", category);
        product.put("price", price);
        product.put("stock", stock);
        return product;
    }

    private static Map<String, String> createMetric(String name, String value, String change) {
        Map<String, String> metric = new HashMap<>();
        metric.put("name", name);
        metric.put("value", value);
        metric.put("change", change);
        return metric;
    }
}

/**
 * Logical Screen - Represents the logical structure of a screen
 * This is format-independent and contains the semantic structure
 */
class LogicalScreen {
    private Map<String, Object> data;
    private List<LogicalElement> elements;

    public LogicalScreen() {
        this.data = new HashMap<>();
        this.elements = new ArrayList<>();
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void addElement(LogicalElement element) {
        elements.add(element);
    }

    public List<LogicalElement> getElements() {
        return elements;
    }

    public Object get(String key) {
        return data.get(key);
    }
}

/**
 * Logical Element - Represents a logical component
 */
class LogicalElement {
    private String type;
    private Map<String, Object> properties;
    private List<LogicalElement> children;

    public LogicalElement(String type) {
        this.type = type;
        this.properties = new HashMap<>();
        this.children = new ArrayList<>();
    }

    public String getType() {
        return type;
    }

    public void setProperty(String key, Object value) {
        properties.put(key, value);
    }

    public Object getProperty(String key) {
        return properties.get(key);
    }

    public Map<String, Object> getProperties() {
        return properties;
    }

    public void addChild(LogicalElement child) {
        children.add(child);
    }

    public List<LogicalElement> getChildren() {
        return children;
    }
}

/**
 * Two Step View Processor - Handles two-step transformation
 */
class TwoStepViewProcessor {

    /**
     * Step 1: Create logical screen from domain data
     */
    public LogicalScreen createLogicalScreen(Map<String, Object> data) {
        LogicalScreen screen = new LogicalScreen();
        screen.setData(data);

        // Create logical elements based on data
        if (data.containsKey("title")) {
            LogicalElement titleElement = new LogicalElement("title");
            titleElement.setProperty("text", data.get("title"));
            screen.addElement(titleElement);
        }

        if (data.containsKey("heading")) {
            LogicalElement headingElement = new LogicalElement("heading");
            headingElement.setProperty("text", data.get("heading"));
            screen.addElement(headingElement);
        }

        if (data.containsKey("content")) {
            LogicalElement contentElement = new LogicalElement("content");
            contentElement.setProperty("text", data.get("content"));
            screen.addElement(contentElement);
        }

        if (data.containsKey("items")) {
            LogicalElement itemsElement = new LogicalElement("list");
            itemsElement.setProperty("items", data.get("items"));
            screen.addElement(itemsElement);
        }

        return screen;
    }

    /**
     * Step 2: Render logical screen to HTML with theme
     */
    public String renderToHTML(LogicalScreen screen, String theme) {
        StringBuilder html = new StringBuilder();
        String cssClass = "theme-" + theme;

        html.append("<html>\n");
        html.append("<head>\n");
        html.append("  <title>").append(screen.get("title")).append("</title>\n");
        html.append("  <style>").append(getThemeCSS(theme)).append("</style>\n");
        html.append("</head>\n");
        html.append("<body class='").append(cssClass).append("'>\n");

        for (LogicalElement element : screen.getElements()) {
            html.append(renderElement(element, theme));
        }

        html.append("</body>\n</html>");
        return html.toString();
    }

    /**
     * Render for specific device type
     */
    public String renderToDevice(LogicalScreen screen, String deviceType) {
        StringBuilder html = new StringBuilder();
        html.append("<html>\n<head>\n");
        html.append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>\n");
        html.append("<style>").append(getDeviceCSS(deviceType)).append("</style>\n");
        html.append("</head>\n<body class='device-").append(deviceType).append("'>\n");

        for (LogicalElement element : screen.getElements()) {
            html.append(renderElementForDevice(element, deviceType));
        }

        html.append("</body>\n</html>");
        return html.toString();
    }

    /**
     * Render to PDF format
     */
    public String renderToPDF(LogicalScreen screen) {
        StringBuilder pdf = new StringBuilder();
        pdf.append("PDF Document\n");
        pdf.append("============\n\n");
        pdf.append("Title: ").append(screen.get("title")).append("\n");
        pdf.append("Heading: ").append(screen.get("heading")).append("\n\n");

        if (screen.get("sales") != null) {
            pdf.append("Sales Data:\n");
            List<Map<String, String>> sales = (List<Map<String, String>>) screen.get("sales");
            for (Map<String, String> sale : sales) {
                pdf.append("- ").append(sale.get("product")).append(": $")
                   .append(sale.get("revenue")).append("\n");
            }
            pdf.append("\nTotal: $").append(screen.get("total")).append("\n");
        }

        return pdf.toString();
    }

    /**
     * Render to plain text
     */
    public String renderToText(LogicalScreen screen) {
        StringBuilder text = new StringBuilder();
        text.append(screen.get("title")).append("\n");
        text.append("=".repeat(screen.get("title").toString().length())).append("\n\n");
        text.append(screen.get("heading")).append("\n\n");

        if (screen.get("sales") != null) {
            List<Map<String, String>> sales = (List<Map<String, String>>) screen.get("sales");
            for (Map<String, String> sale : sales) {
                text.append(sale.get("product")).append(": $")
                    .append(sale.get("revenue")).append("\n");
            }
            text.append("\nTotal: $").append(screen.get("total"));
        }

        return text.toString();
    }

    /**
     * Render with accessibility features
     */
    public String renderAccessible(LogicalScreen screen) {
        StringBuilder html = new StringBuilder();
        html.append("<html lang='en'>\n<head>\n");
        html.append("<title>").append(screen.get("title")).append("</title>\n");
        html.append("</head>\n<body>\n");
        html.append("<main role='main'>\n");
        html.append("  <h1 tabindex='0'>").append(screen.get("heading")).append("</h1>\n");
        html.append("  <p tabindex='0'>").append(screen.get("content")).append("</p>\n");

        if (screen.get("sections") != null) {
            List<Map<String, String>> sections = (List<Map<String, String>>) screen.get("sections");
            for (Map<String, String> section : sections) {
                html.append("  <section aria-labelledby='section-")
                    .append(section.get("title").toLowerCase().replace(" ", "-"))
                    .append("'>\n");
                html.append("    <h2 id='section-")
                    .append(section.get("title").toLowerCase().replace(" ", "-"))
                    .append("'>").append(section.get("title")).append("</h2>\n");
                html.append("    <p>").append(section.get("content")).append("</p>\n");
                html.append("  </section>\n");
            }
        }

        html.append("</main>\n</body>\n</html>");
        return html.toString();
    }

    /**
     * Render for print
     */
    public String renderForPrint(LogicalScreen screen) {
        StringBuilder html = new StringBuilder();
        html.append("<html>\n<head>\n<style>\n");
        html.append("@media print {\n");
        html.append("  body { font-family: serif; }\n");
        html.append("  .no-print { display: none; }\n");
        html.append("}\n");
        html.append("</style>\n</head>\n<body>\n");
        html.append("<div class='invoice'>\n");
        html.append("  <h1>").append(screen.get("heading")).append("</h1>\n");

        if (screen.get("items") != null) {
            html.append("  <table border='1'>\n");
            html.append("    <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>\n");
            List<Map<String, String>> items = (List<Map<String, String>>) screen.get("items");
            for (Map<String, String> item : items) {
                html.append("    <tr>\n");
                html.append("      <td>").append(item.get("description")).append("</td>\n");
                html.append("      <td>").append(item.get("quantity")).append("</td>\n");
                html.append("      <td>$").append(item.get("rate")).append("</td>\n");
                html.append("      <td>$").append(item.get("amount")).append("</td>\n");
                html.append("    </tr>\n");
            }
            html.append("  </table>\n");
            html.append("  <p><strong>Total: $").append(screen.get("total")).append("</strong></p>\n");
        }

        html.append("</div>\n</body>\n</html>");
        return html.toString();
    }

    /**
     * Render for email
     */
    public String renderForEmail(LogicalScreen screen) {
        StringBuilder html = new StringBuilder();
        html.append("<html>\n<body style='font-family: Arial, sans-serif; max-width: 600px;'>\n");
        html.append("<h2>Order Confirmation</h2>\n");
        html.append("<p>Dear ").append(screen.get("recipient")).append(",</p>\n");
        html.append("<p>Thank you for your order #").append(screen.get("orderId")).append("!</p>\n");

        if (screen.get("orderItems") != null) {
            html.append("<table border='1' cellpadding='5' style='border-collapse: collapse;'>\n");
            html.append("<tr style='background: #f0f0f0;'><th>Item</th><th>Qty</th><th>Price</th></tr>\n");
            List<Map<String, String>> items = (List<Map<String, String>>) screen.get("orderItems");
            for (Map<String, String> item : items) {
                html.append("<tr>\n");
                html.append("  <td>").append(item.get("name")).append("</td>\n");
                html.append("  <td>").append(item.get("quantity")).append("</td>\n");
                html.append("  <td>$").append(item.get("price")).append("</td>\n");
                html.append("</tr>\n");
            }
            html.append("</table>\n");
            html.append("<p><strong>Total: $").append(screen.get("total")).append("</strong></p>\n");
        }

        html.append("<p>Thank you for shopping with us!</p>\n");
        html.append("</body>\n</html>");
        return html.toString();
    }

    /**
     * Render dashboard with different layouts
     */
    public String renderDashboard(LogicalScreen screen, String layout) {
        StringBuilder html = new StringBuilder();
        html.append("<html>\n<head><title>").append(screen.get("title")).append("</title></head>\n");
        html.append("<body class='layout-").append(layout).append("'>\n");
        html.append("<h1>").append(screen.get("title")).append("</h1>\n");

        Map<String, String> stats = (Map<String, String>) screen.get("stats");
        if (stats != null) {
            if (layout.equals("grid")) {
                html.append("<div class='stats-grid'>\n");
                for (Map.Entry<String, String> stat : stats.entrySet()) {
                    html.append("  <div class='stat-card'><h3>")
                        .append(formatLabel(stat.getKey())).append("</h3><p>")
                        .append(stat.getValue()).append("</p></div>\n");
                }
                html.append("</div>\n");
            } else if (layout.equals("list")) {
                html.append("<ul class='stats-list'>\n");
                for (Map.Entry<String, String> stat : stats.entrySet()) {
                    html.append("  <li><strong>").append(formatLabel(stat.getKey()))
                        .append(":</strong> ").append(stat.getValue()).append("</li>\n");
                }
                html.append("</ul>\n");
            } else {
                html.append("<p>").append(String.join(" | ",
                    stats.values())).append("</p>\n");
            }
        }

        html.append("</body>\n</html>");
        return html.toString();
    }

    /**
     * Render product catalog with different presentations
     */
    public String renderProductCatalog(LogicalScreen screen, String presentation) {
        StringBuilder html = new StringBuilder();
        html.append("<html>\n<head><title>").append(screen.get("title")).append("</title></head>\n");
        html.append("<body>\n<h1>").append(screen.get("storeName")).append(" Catalog</h1>\n");

        List<Map<String, String>> products = (List<Map<String, String>>) screen.get("products");
        if (products != null) {
            if (presentation.equals("card")) {
                html.append("<div class='product-grid'>\n");
                for (Map<String, String> product : products) {
                    html.append("  <div class='product-card'>\n");
                    html.append("    <h3>").append(product.get("name")).append("</h3>\n");
                    html.append("    <p>").append(product.get("category")).append("</p>\n");
                    html.append("    <p class='price'>$").append(product.get("price")).append("</p>\n");
                    html.append("  </div>\n");
                }
                html.append("</div>\n");
            } else if (presentation.equals("table")) {
                html.append("<table border='1'>\n");
                html.append("<tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th></tr>\n");
                for (Map<String, String> product : products) {
                    html.append("<tr><td>").append(product.get("name")).append("</td><td>")
                        .append(product.get("category")).append("</td><td>$")
                        .append(product.get("price")).append("</td><td>")
                        .append(product.get("stock")).append("</td></tr>\n");
                }
                html.append("</table>\n");
            } else {
                html.append("<ul class='product-list'>\n");
                for (Map<String, String> product : products) {
                    html.append("  <li>").append(product.get("name")).append(" - $")
                        .append(product.get("price")).append("</li>\n");
                }
                html.append("</ul>\n");
            }
        }

        html.append("</body>\n</html>");
        return html.toString();
    }

    /**
     * Render report with different formats
     */
    public String renderReport(LogicalScreen screen, String format) {
        StringBuilder html = new StringBuilder();
        html.append("<html>\n<head><title>").append(screen.get("title")).append("</title></head>\n");
        html.append("<body class='report-").append(format).append("'>\n");
        html.append("<h1>").append(screen.get("title")).append("</h1>\n");
        html.append("<p>").append(screen.get("reportDate")).append(" - ")
            .append(screen.get("company")).append("</p>\n");

        List<Map<String, String>> metrics = (List<Map<String, String>>) screen.get("metrics");
        if (metrics != null) {
            if (format.equals("executive")) {
                html.append("<div class='executive-summary'>\n");
                for (Map<String, String> metric : metrics) {
                    html.append("  <p><strong>").append(metric.get("name"))
                        .append(":</strong> $").append(metric.get("value"))
                        .append(" (").append(metric.get("change")).append(")</p>\n");
                }
                html.append("</div>\n");
            } else if (format.equals("detailed")) {
                html.append("<table border='1'>\n");
                html.append("<tr><th>Metric</th><th>Value</th><th>Change</th></tr>\n");
                for (Map<String, String> metric : metrics) {
                    html.append("<tr><td>").append(metric.get("name"))
                        .append("</td><td>$").append(metric.get("value"))
                        .append("</td><td>").append(metric.get("change"))
                        .append("</td></tr>\n");
                }
                html.append("</table>\n");
            } else {
                html.append("<div class='presentation'>\n");
                for (Map<String, String> metric : metrics) {
                    html.append("  <div class='slide'>\n");
                    html.append("    <h2>").append(metric.get("name")).append("</h2>\n");
                    html.append("    <h1>$").append(metric.get("value")).append("</h1>\n");
                    html.append("    <p>").append(metric.get("change")).append("</p>\n");
                    html.append("  </div>\n");
                }
                html.append("</div>\n");
            }
        }

        html.append("</body>\n</html>");
        return html.toString();
    }

    // Helper methods

    private String renderElement(LogicalElement element, String theme) {
        switch (element.getType()) {
            case "title":
                return "";  // Already in head
            case "heading":
                return "  <h1>" + element.getProperty("text") + "</h1>\n";
            case "content":
                return "  <p>" + element.getProperty("text") + "</p>\n";
            case "list":
                StringBuilder list = new StringBuilder("  <ul>\n");
                List<Map<String, String>> items = (List<Map<String, String>>) element.getProperty("items");
                for (Map<String, String> item : items) {
                    list.append("    <li>").append(item.get("name"))
                        .append(": ").append(item.get("description")).append("</li>\n");
                }
                list.append("  </ul>\n");
                return list.toString();
            default:
                return "";
        }
    }

    private String renderElementForDevice(LogicalElement element, String deviceType) {
        String prefix = deviceType.equals("mobile") ? "  " : "";
        return renderElement(element, "default");
    }

    private String getThemeCSS(String theme) {
        switch (theme) {
            case "light":
                return "body { background: #fff; color: #000; }";
            case "dark":
                return "body { background: #222; color: #eee; }";
            case "high-contrast":
                return "body { background: #000; color: #ff0; }";
            default:
                return "body { background: #f5f5f5; color: #333; }";
        }
    }

    private String getDeviceCSS(String deviceType) {
        switch (deviceType) {
            case "mobile":
                return "body { font-size: 14px; padding: 10px; }";
            case "tablet":
                return "body { font-size: 16px; padding: 20px; }";
            case "desktop":
                return "body { font-size: 18px; padding: 40px; max-width: 1200px; margin: 0 auto; }";
            default:
                return "";
        }
    }

    private String formatLabel(String key) {
        return key.replaceAll("([A-Z])", " $1")
                  .substring(0, 1).toUpperCase() +
               key.replaceAll("([A-Z])", " $1").substring(1);
    }
}
