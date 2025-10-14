package Enterprise.Web.TransformView;

import java.util.*;
import java.io.*;
import javax.xml.parsers.*;
import javax.xml.transform.*;
import javax.xml.transform.dom.*;
import javax.xml.transform.stream.*;
import org.w3c.dom.*;

/**
 * Transform View Pattern Implementation
 *
 * Purpose:
 * Transforms domain data into HTML using XSLT or similar transformation technologies.
 * The view is defined as a transformation that converts structured data (XML/JSON)
 * into presentation format.
 *
 * Benefits:
 * - Clear separation between data and presentation
 * - Transformations can be changed without modifying code
 * - Multiple presentation formats from same data
 * - Powerful transformation capabilities
 *
 * This implementation demonstrates:
 * 1. Basic XML to HTML transformation
 * 2. Product catalog with XSLT styling
 * 3. Order invoice generation
 * 4. RSS feed generation
 * 5. JSON to HTML transformation
 * 6. Multi-format output (HTML, PDF, XML)
 * 7. Dynamic chart generation
 * 8. Email template transformation
 * 9. API response formatting
 * 10. Custom transformation pipelines
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("=== Transform View Pattern Demo ===\n");

        TransformEngine engine = new TransformEngine();

        // Scenario 1: Basic XML to HTML Transformation
        demonstrateBasicTransform(engine);

        // Scenario 2: Product Catalog Transformation
        demonstrateProductCatalog(engine);

        // Scenario 3: Order Invoice Generation
        demonstrateInvoiceGeneration(engine);

        // Scenario 4: RSS Feed Generation
        demonstrateRSSFeed(engine);

        // Scenario 5: JSON to HTML Transformation
        demonstrateJSONTransform(engine);

        // Scenario 6: Multi-format Output
        demonstrateMultiFormat(engine);

        // Scenario 7: Dynamic Chart Generation
        demonstrateChartGeneration(engine);

        // Scenario 8: Email Template Transformation
        demonstrateEmailTransform(engine);

        // Scenario 9: API Response Formatting
        demonstrateAPIResponse(engine);

        // Scenario 10: Custom Transformation Pipeline
        demonstrateTransformPipeline(engine);
    }

    /**
     * Scenario 1: Basic XML to HTML Transformation
     */
    private static void demonstrateBasicTransform(TransformEngine engine) {
        System.out.println("\n--- Scenario 1: Basic XML to HTML Transformation ---");

        String xmlData = "<?xml version='1.0'?>\n" +
            "<page>\n" +
            "  <title>Welcome</title>\n" +
            "  <heading>Hello World</heading>\n" +
            "  <content>This is a basic transformation example.</content>\n" +
            "</page>";

        String xsltTemplate = "<?xml version='1.0'?>\n" +
            "<xsl:stylesheet version='1.0' xmlns:xsl='http://www.w3.org/1999/XSL/Transform'>\n" +
            "  <xsl:template match='/'>\n" +
            "    <html>\n" +
            "      <head><title><xsl:value-of select='page/title'/></title></head>\n" +
            "      <body>\n" +
            "        <h1><xsl:value-of select='page/heading'/></h1>\n" +
            "        <p><xsl:value-of select='page/content'/></p>\n" +
            "      </body>\n" +
            "    </html>\n" +
            "  </xsl:template>\n" +
            "</xsl:stylesheet>";

        String result = engine.transform(xmlData, xsltTemplate);
        System.out.println(result);
    }

    /**
     * Scenario 2: Product Catalog Transformation
     */
    private static void demonstrateProductCatalog(TransformEngine engine) {
        System.out.println("\n--- Scenario 2: Product Catalog Transformation ---");

        String xmlData = "<?xml version='1.0'?>\n" +
            "<catalog>\n" +
            "  <store>TechStore</store>\n" +
            "  <product id='1'>\n" +
            "    <name>Laptop</name>\n" +
            "    <category>Electronics</category>\n" +
            "    <price>999.99</price>\n" +
            "    <stock>15</stock>\n" +
            "    <rating>4.5</rating>\n" +
            "  </product>\n" +
            "  <product id='2'>\n" +
            "    <name>Mouse</name>\n" +
            "    <category>Accessories</category>\n" +
            "    <price>29.99</price>\n" +
            "    <stock>50</stock>\n" +
            "    <rating>4.2</rating>\n" +
            "  </product>\n" +
            "  <product id='3'>\n" +
            "    <name>Keyboard</name>\n" +
            "    <category>Accessories</category>\n" +
            "    <price>79.99</price>\n" +
            "    <stock>30</stock>\n" +
            "    <rating>4.7</rating>\n" +
            "  </product>\n" +
            "</catalog>";

        String xsltTemplate = "<?xml version='1.0'?>\n" +
            "<xsl:stylesheet version='1.0' xmlns:xsl='http://www.w3.org/1999/XSL/Transform'>\n" +
            "  <xsl:template match='/'>\n" +
            "    <html>\n" +
            "      <head><title><xsl:value-of select='catalog/store'/> Catalog</title></head>\n" +
            "      <body>\n" +
            "        <h1><xsl:value-of select='catalog/store'/> Product Catalog</h1>\n" +
            "        <div class='products'>\n" +
            "          <xsl:for-each select='catalog/product'>\n" +
            "            <xsl:sort select='price' data-type='number'/>\n" +
            "            <div class='product'>\n" +
            "              <h3><xsl:value-of select='name'/></h3>\n" +
            "              <p>Category: <xsl:value-of select='category'/></p>\n" +
            "              <p class='price'>$<xsl:value-of select='price'/></p>\n" +
            "              <p>Stock: <xsl:value-of select='stock'/> units</p>\n" +
            "              <p>Rating: <xsl:value-of select='rating'/>/5.0</p>\n" +
            "              <xsl:if test='stock &lt; 20'>\n" +
            "                <span class='low-stock'>Low Stock!</span>\n" +
            "              </xsl:if>\n" +
            "            </div>\n" +
            "          </xsl:for-each>\n" +
            "        </div>\n" +
            "      </body>\n" +
            "    </html>\n" +
            "  </xsl:template>\n" +
            "</xsl:stylesheet>";

        String result = engine.transform(xmlData, xsltTemplate);
        System.out.println(result);
    }

    /**
     * Scenario 3: Order Invoice Generation
     */
    private static void demonstrateInvoiceGeneration(TransformEngine engine) {
        System.out.println("\n--- Scenario 3: Order Invoice Generation ---");

        String xmlData = "<?xml version='1.0'?>\n" +
            "<invoice>\n" +
            "  <number>INV-2024-001</number>\n" +
            "  <date>2024-10-14</date>\n" +
            "  <dueDate>2024-11-14</dueDate>\n" +
            "  <company>\n" +
            "    <name>TechStore Inc.</name>\n" +
            "    <address>456 Business Ave, City, State 12345</address>\n" +
            "  </company>\n" +
            "  <client>\n" +
            "    <name>Acme Corporation</name>\n" +
            "    <address>789 Client St, Town, State 67890</address>\n" +
            "  </client>\n" +
            "  <items>\n" +
            "    <item>\n" +
            "      <description>Web Development Services</description>\n" +
            "      <quantity>40</quantity>\n" +
            "      <rate>50.00</rate>\n" +
            "    </item>\n" +
            "    <item>\n" +
            "      <description>Design Consultation</description>\n" +
            "      <quantity>5</quantity>\n" +
            "      <rate>100.00</rate>\n" +
            "    </item>\n" +
            "  </items>\n" +
            "  <subtotal>2500.00</subtotal>\n" +
            "  <taxRate>8.5</taxRate>\n" +
            "  <taxAmount>212.50</taxAmount>\n" +
            "  <total>2712.50</total>\n" +
            "</invoice>";

        String xsltTemplate = "<?xml version='1.0'?>\n" +
            "<xsl:stylesheet version='1.0' xmlns:xsl='http://www.w3.org/1999/XSL/Transform'>\n" +
            "  <xsl:template match='/'>\n" +
            "    <html>\n" +
            "      <head><title>Invoice <xsl:value-of select='invoice/number'/></title></head>\n" +
            "      <body>\n" +
            "        <h1>INVOICE</h1>\n" +
            "        <div class='header'>\n" +
            "          <p>Invoice #<xsl:value-of select='invoice/number'/></p>\n" +
            "          <p>Date: <xsl:value-of select='invoice/date'/></p>\n" +
            "          <p>Due Date: <xsl:value-of select='invoice/dueDate'/></p>\n" +
            "        </div>\n" +
            "        <div class='parties'>\n" +
            "          <div class='from'>\n" +
            "            <h3>From:</h3>\n" +
            "            <p><xsl:value-of select='invoice/company/name'/></p>\n" +
            "            <p><xsl:value-of select='invoice/company/address'/></p>\n" +
            "          </div>\n" +
            "          <div class='to'>\n" +
            "            <h3>Bill To:</h3>\n" +
            "            <p><xsl:value-of select='invoice/client/name'/></p>\n" +
            "            <p><xsl:value-of select='invoice/client/address'/></p>\n" +
            "          </div>\n" +
            "        </div>\n" +
            "        <table>\n" +
            "          <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>\n" +
            "          <xsl:for-each select='invoice/items/item'>\n" +
            "            <tr>\n" +
            "              <td><xsl:value-of select='description'/></td>\n" +
            "              <td><xsl:value-of select='quantity'/></td>\n" +
            "              <td>$<xsl:value-of select='rate'/></td>\n" +
            "              <td>$<xsl:value-of select='quantity * rate'/></td>\n" +
            "            </tr>\n" +
            "          </xsl:for-each>\n" +
            "        </table>\n" +
            "        <div class='totals'>\n" +
            "          <p>Subtotal: $<xsl:value-of select='invoice/subtotal'/></p>\n" +
            "          <p>Tax (<xsl:value-of select='invoice/taxRate'/>%): $<xsl:value-of select='invoice/taxAmount'/></p>\n" +
            "          <p class='total'>Total: $<xsl:value-of select='invoice/total'/></p>\n" +
            "        </div>\n" +
            "      </body>\n" +
            "    </html>\n" +
            "  </xsl:template>\n" +
            "</xsl:stylesheet>";

        String result = engine.transform(xmlData, xsltTemplate);
        System.out.println(result);
    }

    /**
     * Scenario 4: RSS Feed Generation
     */
    private static void demonstrateRSSFeed(TransformEngine engine) {
        System.out.println("\n--- Scenario 4: RSS Feed Generation ---");

        String xmlData = "<?xml version='1.0'?>\n" +
            "<blog>\n" +
            "  <title>Tech Blog</title>\n" +
            "  <link>https://techblog.example.com</link>\n" +
            "  <description>Latest technology news and tutorials</description>\n" +
            "  <post>\n" +
            "    <title>Understanding Design Patterns</title>\n" +
            "    <link>https://techblog.example.com/design-patterns</link>\n" +
            "    <pubDate>2024-10-14</pubDate>\n" +
            "    <author>John Developer</author>\n" +
            "    <description>A comprehensive guide to design patterns</description>\n" +
            "  </post>\n" +
            "  <post>\n" +
            "    <title>Java Best Practices</title>\n" +
            "    <link>https://techblog.example.com/java-practices</link>\n" +
            "    <pubDate>2024-10-13</pubDate>\n" +
            "    <author>Jane Coder</author>\n" +
            "    <description>Essential Java coding best practices</description>\n" +
            "  </post>\n" +
            "</blog>";

        String xsltTemplate = "<?xml version='1.0'?>\n" +
            "<xsl:stylesheet version='1.0' xmlns:xsl='http://www.w3.org/1999/XSL/Transform'>\n" +
            "  <xsl:template match='/'>\n" +
            "    <rss version='2.0'>\n" +
            "      <channel>\n" +
            "        <title><xsl:value-of select='blog/title'/></title>\n" +
            "        <link><xsl:value-of select='blog/link'/></link>\n" +
            "        <description><xsl:value-of select='blog/description'/></description>\n" +
            "        <xsl:for-each select='blog/post'>\n" +
            "          <item>\n" +
            "            <title><xsl:value-of select='title'/></title>\n" +
            "            <link><xsl:value-of select='link'/></link>\n" +
            "            <pubDate><xsl:value-of select='pubDate'/></pubDate>\n" +
            "            <author><xsl:value-of select='author'/></author>\n" +
            "            <description><xsl:value-of select='description'/></description>\n" +
            "          </item>\n" +
            "        </xsl:for-each>\n" +
            "      </channel>\n" +
            "    </rss>\n" +
            "  </xsl:template>\n" +
            "</xsl:stylesheet>";

        String result = engine.transform(xmlData, xsltTemplate);
        System.out.println(result);
    }

    /**
     * Scenario 5: JSON to HTML Transformation
     */
    private static void demonstrateJSONTransform(TransformEngine engine) {
        System.out.println("\n--- Scenario 5: JSON to HTML Transformation ---");

        // Simplified JSON-like representation
        String jsonData = "{\n" +
            "  \"user\": {\n" +
            "    \"name\": \"John Doe\",\n" +
            "    \"email\": \"john@example.com\",\n" +
            "    \"role\": \"admin\"\n" +
            "  },\n" +
            "  \"stats\": {\n" +
            "    \"posts\": 42,\n" +
            "    \"followers\": 1234,\n" +
            "    \"following\": 567\n" +
            "  }\n" +
            "}";

        String htmlResult = engine.transformJSON(jsonData);
        System.out.println(htmlResult);
    }

    /**
     * Scenario 6: Multi-format Output
     */
    private static void demonstrateMultiFormat(TransformEngine engine) {
        System.out.println("\n--- Scenario 6: Multi-format Output ---");

        String xmlData = "<?xml version='1.0'?>\n" +
            "<report>\n" +
            "  <title>Sales Report</title>\n" +
            "  <date>2024-10-14</date>\n" +
            "  <data>\n" +
            "    <sale><product>Laptop</product><amount>999.99</amount></sale>\n" +
            "    <sale><product>Mouse</product><amount>29.99</amount></sale>\n" +
            "    <sale><product>Keyboard</product><amount>79.99</amount></sale>\n" +
            "  </data>\n" +
            "  <total>1109.97</total>\n" +
            "</report>";

        // HTML output
        System.out.println("-- HTML Format --");
        String htmlOutput = engine.transformToHTML(xmlData);
        System.out.println(htmlOutput);

        // CSV output
        System.out.println("\n-- CSV Format --");
        String csvOutput = engine.transformToCSV(xmlData);
        System.out.println(csvOutput);

        // Plain text output
        System.out.println("\n-- Text Format --");
        String textOutput = engine.transformToText(xmlData);
        System.out.println(textOutput);
    }

    /**
     * Scenario 7: Dynamic Chart Generation
     */
    private static void demonstrateChartGeneration(TransformEngine engine) {
        System.out.println("\n--- Scenario 7: Dynamic Chart Generation ---");

        String xmlData = "<?xml version='1.0'?>\n" +
            "<chartData>\n" +
            "  <title>Monthly Sales</title>\n" +
            "  <dataPoint><label>Jan</label><value>12500</value></dataPoint>\n" +
            "  <dataPoint><label>Feb</label><value>15300</value></dataPoint>\n" +
            "  <dataPoint><label>Mar</label><value>18900</value></dataPoint>\n" +
            "  <dataPoint><label>Apr</label><value>16200</value></dataPoint>\n" +
            "  <dataPoint><label>May</label><value>21000</value></dataPoint>\n" +
            "</chartData>";

        String chartHTML = engine.transformToChart(xmlData);
        System.out.println(chartHTML);
    }

    /**
     * Scenario 8: Email Template Transformation
     */
    private static void demonstrateEmailTransform(TransformEngine engine) {
        System.out.println("\n--- Scenario 8: Email Template Transformation ---");

        String xmlData = "<?xml version='1.0'?>\n" +
            "<email>\n" +
            "  <type>orderConfirmation</type>\n" +
            "  <recipient>\n" +
            "    <name>Jane Smith</name>\n" +
            "    <email>jane@example.com</email>\n" +
            "  </recipient>\n" +
            "  <order>\n" +
            "    <id>12345</id>\n" +
            "    <date>2024-10-14</date>\n" +
            "    <total>1109.97</total>\n" +
            "    <items>\n" +
            "      <item><name>Laptop</name><qty>1</qty><price>999.99</price></item>\n" +
            "      <item><name>Mouse</name><qty>2</qty><price>29.99</price></item>\n" +
            "    </items>\n" +
            "  </order>\n" +
            "</email>";

        String emailHTML = engine.transformToEmail(xmlData);
        System.out.println(emailHTML);
    }

    /**
     * Scenario 9: API Response Formatting
     */
    private static void demonstrateAPIResponse(TransformEngine engine) {
        System.out.println("\n--- Scenario 9: API Response Formatting ---");

        String xmlData = "<?xml version='1.0'?>\n" +
            "<apiResponse>\n" +
            "  <status>success</status>\n" +
            "  <code>200</code>\n" +
            "  <data>\n" +
            "    <user id='123'>\n" +
            "      <name>John Doe</name>\n" +
            "      <email>john@example.com</email>\n" +
            "    </user>\n" +
            "  </data>\n" +
            "</apiResponse>";

        // Transform to different API formats
        System.out.println("-- JSON Format --");
        String jsonFormat = engine.transformToAPIJSON(xmlData);
        System.out.println(jsonFormat);

        System.out.println("\n-- XML Format --");
        String xmlFormat = engine.transformToAPIXML(xmlData);
        System.out.println(xmlFormat);
    }

    /**
     * Scenario 10: Custom Transformation Pipeline
     */
    private static void demonstrateTransformPipeline(TransformEngine engine) {
        System.out.println("\n--- Scenario 10: Custom Transformation Pipeline ---");

        String xmlData = "<?xml version='1.0'?>\n" +
            "<data>\n" +
            "  <products>\n" +
            "    <product><name>Laptop</name><price>999.99</price></product>\n" +
            "    <product><name>Mouse</name><price>29.99</price></product>\n" +
            "  </products>\n" +
            "</data>";

        // Create transformation pipeline
        TransformPipeline pipeline = new TransformPipeline();
        pipeline.addTransform(new FilterTransform("price > 50"));
        pipeline.addTransform(new SortTransform("price", "desc"));
        pipeline.addTransform(new FormatTransform("html"));

        String result = pipeline.execute(xmlData);
        System.out.println(result);
    }
}

/**
 * Transform Engine - Handles various transformation operations
 */
class TransformEngine {

    /**
     * Transform XML using XSLT stylesheet
     */
    public String transform(String xmlData, String xsltTemplate) {
        try {
            TransformerFactory factory = TransformerFactory.newInstance();
            Transformer transformer = factory.newTransformer(
                new StreamSource(new StringReader(xsltTemplate))
            );

            StringWriter writer = new StringWriter();
            transformer.transform(
                new StreamSource(new StringReader(xmlData)),
                new StreamResult(writer)
            );

            return writer.toString();
        } catch (Exception e) {
            return "Transformation error: " + e.getMessage();
        }
    }

    /**
     * Transform JSON to HTML
     */
    public String transformJSON(String jsonData) {
        StringBuilder html = new StringBuilder();
        html.append("<html>\n<body>\n");
        html.append("<div class='json-data'>\n");

        // Simple JSON parsing for demonstration
        String[] lines = jsonData.split("\n");
        for (String line : lines) {
            line = line.trim();
            if (line.contains(":")) {
                String[] parts = line.split(":", 2);
                String key = parts[0].replace("\"", "").trim();
                String value = parts[1].replace("\"", "").replace(",", "").trim();
                if (!key.isEmpty() && !value.isEmpty() && !value.equals("{") && !value.equals("}")) {
                    html.append("  <p><strong>").append(key).append(":</strong> ")
                        .append(value).append("</p>\n");
                }
            }
        }

        html.append("</div>\n</body>\n</html>");
        return html.toString();
    }

    /**
     * Transform to HTML format
     */
    public String transformToHTML(String xmlData) {
        StringBuilder html = new StringBuilder();
        html.append("<html>\n<head><title>Sales Report</title></head>\n<body>\n");
        html.append("<h1>Sales Report</h1>\n");
        html.append("<table border='1'>\n");
        html.append("<tr><th>Product</th><th>Amount</th></tr>\n");

        // Parse XML data
        if (xmlData.contains("<sale>")) {
            String[] sales = xmlData.split("<sale>");
            for (int i = 1; i < sales.length; i++) {
                String sale = sales[i];
                String product = extractValue(sale, "product");
                String amount = extractValue(sale, "amount");
                html.append("<tr><td>").append(product).append("</td><td>$")
                    .append(amount).append("</td></tr>\n");
            }
        }

        html.append("</table>\n</body>\n</html>");
        return html.toString();
    }

    /**
     * Transform to CSV format
     */
    public String transformToCSV(String xmlData) {
        StringBuilder csv = new StringBuilder();
        csv.append("Product,Amount\n");

        if (xmlData.contains("<sale>")) {
            String[] sales = xmlData.split("<sale>");
            for (int i = 1; i < sales.length; i++) {
                String sale = sales[i];
                String product = extractValue(sale, "product");
                String amount = extractValue(sale, "amount");
                csv.append(product).append(",").append(amount).append("\n");
            }
        }

        return csv.toString();
    }

    /**
     * Transform to plain text format
     */
    public String transformToText(String xmlData) {
        StringBuilder text = new StringBuilder();
        text.append("SALES REPORT\n");
        text.append("============\n\n");

        if (xmlData.contains("<sale>")) {
            String[] sales = xmlData.split("<sale>");
            for (int i = 1; i < sales.length; i++) {
                String sale = sales[i];
                String product = extractValue(sale, "product");
                String amount = extractValue(sale, "amount");
                text.append(product).append(": $").append(amount).append("\n");
            }
        }

        String total = extractValue(xmlData, "total");
        text.append("\nTotal: $").append(total);

        return text.toString();
    }

    /**
     * Transform to chart HTML
     */
    public String transformToChart(String xmlData) {
        StringBuilder html = new StringBuilder();
        html.append("<html>\n<head><title>Chart</title>\n");
        html.append("<style>\n");
        html.append(".chart { margin: 20px; }\n");
        html.append(".bar { background: #4CAF50; color: white; padding: 5px; margin: 2px; }\n");
        html.append("</style>\n</head>\n<body>\n");

        String title = extractValue(xmlData, "title");
        html.append("<h1>").append(title).append("</h1>\n");
        html.append("<div class='chart'>\n");

        if (xmlData.contains("<dataPoint>")) {
            String[] points = xmlData.split("<dataPoint>");
            for (int i = 1; i < points.length; i++) {
                String point = points[i];
                String label = extractValue(point, "label");
                String value = extractValue(point, "value");
                int width = Integer.parseInt(value) / 100; // Scale down for display
                html.append("  <div class='bar' style='width: ").append(width)
                    .append("px'>").append(label).append(": $").append(value)
                    .append("</div>\n");
            }
        }

        html.append("</div>\n</body>\n</html>");
        return html.toString();
    }

    /**
     * Transform to email HTML
     */
    public String transformToEmail(String xmlData) {
        StringBuilder html = new StringBuilder();
        html.append("<html>\n<body style='font-family: Arial, sans-serif;'>\n");

        String recipientName = extractNestedValue(xmlData, "recipient", "name");
        String orderId = extractNestedValue(xmlData, "order", "id");
        String orderTotal = extractNestedValue(xmlData, "order", "total");

        html.append("<h2>Order Confirmation</h2>\n");
        html.append("<p>Dear ").append(recipientName).append(",</p>\n");
        html.append("<p>Thank you for your order #").append(orderId).append("!</p>\n");
        html.append("<h3>Order Details:</h3>\n");
        html.append("<table border='1' cellpadding='5'>\n");
        html.append("<tr><th>Item</th><th>Qty</th><th>Price</th></tr>\n");

        if (xmlData.contains("<item>")) {
            String[] items = xmlData.split("<item>");
            for (int i = 1; i < items.length; i++) {
                String item = items[i];
                String name = extractValue(item, "name");
                String qty = extractValue(item, "qty");
                String price = extractValue(item, "price");
                html.append("<tr><td>").append(name).append("</td><td>")
                    .append(qty).append("</td><td>$").append(price).append("</td></tr>\n");
            }
        }

        html.append("</table>\n");
        html.append("<p><strong>Total: $").append(orderTotal).append("</strong></p>\n");
        html.append("<p>Thank you for shopping with us!</p>\n");
        html.append("</body>\n</html>");

        return html.toString();
    }

    /**
     * Transform to API JSON format
     */
    public String transformToAPIJSON(String xmlData) {
        StringBuilder json = new StringBuilder();
        json.append("{\n");
        json.append("  \"status\": \"").append(extractValue(xmlData, "status")).append("\",\n");
        json.append("  \"code\": ").append(extractValue(xmlData, "code")).append(",\n");
        json.append("  \"data\": {\n");
        json.append("    \"user\": {\n");
        json.append("      \"name\": \"").append(extractNestedValue(xmlData, "user", "name")).append("\",\n");
        json.append("      \"email\": \"").append(extractNestedValue(xmlData, "user", "email")).append("\"\n");
        json.append("    }\n");
        json.append("  }\n");
        json.append("}");
        return json.toString();
    }

    /**
     * Transform to API XML format
     */
    public String transformToAPIXML(String xmlData) {
        return xmlData; // Already in XML format
    }

    /**
     * Extract value from XML tag
     */
    private String extractValue(String xml, String tag) {
        String startTag = "<" + tag + ">";
        String endTag = "</" + tag + ">";
        int start = xml.indexOf(startTag);
        int end = xml.indexOf(endTag);
        if (start != -1 && end != -1) {
            return xml.substring(start + startTag.length(), end).trim();
        }
        return "";
    }

    /**
     * Extract nested value from XML
     */
    private String extractNestedValue(String xml, String parentTag, String childTag) {
        String startParent = "<" + parentTag + ">";
        String endParent = "</" + parentTag + ">";
        int parentStart = xml.indexOf(startParent);
        int parentEnd = xml.indexOf(endParent);

        if (parentStart != -1 && parentEnd != -1) {
            String parentContent = xml.substring(parentStart, parentEnd);
            return extractValue(parentContent, childTag);
        }
        return "";
    }
}

/**
 * Transformation Pipeline - Chain multiple transformations
 */
class TransformPipeline {
    private List<Transform> transforms = new ArrayList<>();

    public void addTransform(Transform transform) {
        transforms.add(transform);
    }

    public String execute(String data) {
        String result = data;
        for (Transform transform : transforms) {
            result = transform.apply(result);
        }
        return result;
    }
}

/**
 * Transform Interface
 */
interface Transform {
    String apply(String data);
}

/**
 * Filter Transform - Filter data based on conditions
 */
class FilterTransform implements Transform {
    private String condition;

    public FilterTransform(String condition) {
        this.condition = condition;
    }

    public String apply(String data) {
        // Simplified filtering logic
        StringBuilder result = new StringBuilder();
        result.append("Filtered data (").append(condition).append("):\n");
        result.append(data);
        return result.toString();
    }
}

/**
 * Sort Transform - Sort data
 */
class SortTransform implements Transform {
    private String field;
    private String order;

    public SortTransform(String field, String order) {
        this.field = field;
        this.order = order;
    }

    public String apply(String data) {
        // Simplified sorting logic
        return "Sorted by " + field + " (" + order + "):\n" + data;
    }
}

/**
 * Format Transform - Format output
 */
class FormatTransform implements Transform {
    private String format;

    public FormatTransform(String format) {
        this.format = format;
    }

    public String apply(String data) {
        // Simplified formatting logic
        return "<" + format + ">\n" + data + "\n</" + format + ">";
    }
}
