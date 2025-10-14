package Enterprise.LazyLoad;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

/**
 * LazyLoad Pattern Demonstration
 *
 * Intent: Defers object initialization until the object is actually needed,
 * optimizing resource usage and improving application startup time.
 *
 * This pattern is particularly useful when:
 * - Object creation is expensive (time or memory)
 * - Objects might not be needed in all execution paths
 * - You want to defer database or network calls
 * - Loading large datasets or files on demand
 *
 * Real-world examples:
 * - Image loading in galleries
 * - Database connection pooling
 * - Configuration file loading
 * - User profile data fetching
 * - Report generation
 * - Cache initialization
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== LazyLoad Pattern Demo ===\n");

        // Scenario 1: Database Record Lazy Loading
        demonstrateDatabaseRecordLoading();

        // Scenario 2: Image Gallery Lazy Loading
        demonstrateImageGalleryLoading();

        // Scenario 3: Configuration Settings Lazy Loading
        demonstrateConfigurationLoading();

        // Scenario 4: User Profile Lazy Loading
        demonstrateUserProfileLoading();

        // Scenario 5: Report Data Lazy Loading
        demonstrateReportDataLoading();

        // Scenario 6: Cache Lazy Initialization
        demonstrateCacheInitialization();

        // Scenario 7: Plugin System Lazy Loading
        demonstratePluginSystemLoading();

        // Scenario 8: Collection Lazy Loading (Virtual Proxy)
        demonstrateCollectionLazyLoading();

        // Scenario 9: Document Processing Lazy Loading
        demonstrateDocumentProcessing();

        // Scenario 10: API Client Lazy Initialization
        demonstrateApiClientInitialization();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Lazy loading of database records
     * Only loads data when first accessed
     */
    private static void demonstrateDatabaseRecordLoading() {
        System.out.println("--- Scenario 1: Database Record Lazy Loading ---");

        LazyEmployee employee = new LazyEmployee(1001, "John Doe");
        System.out.println("Employee created: " + employee.getName());
        System.out.println("Details not loaded yet...");

        // Details loaded only when accessed
        EmployeeDetails details = employee.getDetails();
        System.out.println("Details loaded: " + details.getDepartment());

        // Subsequent access uses cached data
        EmployeeDetails cachedDetails = employee.getDetails();
        System.out.println("Using cached details: " + cachedDetails.getPosition());

        System.out.println();
    }

    /**
     * Scenario 2: Lazy loading images in a gallery
     * Images loaded only when displayed
     */
    private static void demonstrateImageGalleryLoading() {
        System.out.println("--- Scenario 2: Image Gallery Lazy Loading ---");

        ImageGallery gallery = new ImageGallery();
        gallery.addImage(new LazyImage("photo1.jpg", "/images/photo1.jpg"));
        gallery.addImage(new LazyImage("photo2.jpg", "/images/photo2.jpg"));
        gallery.addImage(new LazyImage("photo3.jpg", "/images/photo3.jpg"));

        System.out.println("Gallery created with 3 images (not loaded yet)");

        // Only load first image
        gallery.displayImage(0);

        // Skip second image, load third
        gallery.displayImage(2);

        System.out.println("Image 2 was never loaded, saving bandwidth!");

        System.out.println();
    }

    /**
     * Scenario 3: Lazy loading of configuration settings
     * Configuration loaded from file only when needed
     */
    private static void demonstrateConfigurationLoading() {
        System.out.println("--- Scenario 3: Configuration Lazy Loading ---");

        ApplicationConfig config = new ApplicationConfig();
        System.out.println("Application started (config not loaded)");

        // Config loaded only when first setting is accessed
        String dbUrl = config.get("database.url");
        System.out.println("Database URL: " + dbUrl);

        String apiKey = config.get("api.key");
        System.out.println("API Key: " + apiKey);

        System.out.println();
    }

    /**
     * Scenario 4: Lazy loading user profiles
     * User data loaded from service only when needed
     */
    private static void demonstrateUserProfileLoading() {
        System.out.println("--- Scenario 4: User Profile Lazy Loading ---");

        LazyUserProfile user = new LazyUserProfile("user123");
        System.out.println("User reference created");

        // Profile loaded on first access
        String email = user.getEmail();
        System.out.println("Email: " + email);

        // Preferences loaded separately when accessed
        Map<String, String> prefs = user.getPreferences();
        System.out.println("Theme: " + prefs.get("theme"));

        System.out.println();
    }

    /**
     * Scenario 5: Lazy loading report data
     * Expensive report generation deferred until needed
     */
    private static void demonstrateReportDataLoading() {
        System.out.println("--- Scenario 5: Report Data Lazy Loading ---");

        LazyReport salesReport = new LazyReport("Q4-2024-Sales", () -> {
            System.out.println("  [Generating expensive sales report...]");
            try { Thread.sleep(500); } catch (InterruptedException e) {}
            return "Total Sales: $1,250,000 | Growth: 15%";
        });

        System.out.println("Report object created (not generated yet)");

        // Report generated only when data is accessed
        String data = salesReport.getData();
        System.out.println("Report: " + data);

        // Cached for subsequent access
        String cachedData = salesReport.getData();
        System.out.println("Retrieved from cache instantly");

        System.out.println();
    }

    /**
     * Scenario 6: Lazy cache initialization
     * Cache system initialized only when first item is added
     */
    private static void demonstrateCacheInitialization() {
        System.out.println("--- Scenario 6: Cache Lazy Initialization ---");

        LazyCacheManager<String, Object> cache = new LazyCacheManager<>();
        System.out.println("Cache manager created (not initialized)");

        // Cache initialized on first use
        cache.put("user:1", new User("Alice"));
        System.out.println("First item added, cache now initialized");

        cache.put("user:2", new User("Bob"));
        Object user = cache.get("user:1");
        System.out.println("Retrieved: " + user);

        System.out.println();
    }

    /**
     * Scenario 7: Lazy loading plugin system
     * Plugins loaded only when requested
     */
    private static void demonstratePluginSystemLoading() {
        System.out.println("--- Scenario 7: Plugin System Lazy Loading ---");

        PluginManager pluginManager = new PluginManager();
        pluginManager.registerPlugin("pdf-export", () -> new PdfExportPlugin());
        pluginManager.registerPlugin("email-sender", () -> new EmailSenderPlugin());
        pluginManager.registerPlugin("image-processor", () -> new ImageProcessorPlugin());

        System.out.println("3 plugins registered (not loaded)");

        // Only load PDF export plugin
        Plugin pdfPlugin = pluginManager.getPlugin("pdf-export");
        pdfPlugin.execute();

        // Other plugins never loaded, saving memory
        System.out.println("Other plugins remain unloaded");

        System.out.println();
    }

    /**
     * Scenario 8: Lazy loading collections with virtual proxy
     * Large collections loaded page by page
     */
    private static void demonstrateCollectionLazyLoading() {
        System.out.println("--- Scenario 8: Collection Lazy Loading ---");

        LazyProductCollection products = new LazyProductCollection("electronics");
        System.out.println("Collection created (no products loaded yet)");

        // Load first page
        List<Product> page1 = products.getPage(0, 10);
        System.out.println("Loaded page 1: " + page1.size() + " products");

        // Load second page only if needed
        List<Product> page2 = products.getPage(1, 10);
        System.out.println("Loaded page 2: " + page2.size() + " products");

        System.out.println("Total available (without loading all): " + products.getTotalCount());

        System.out.println();
    }

    /**
     * Scenario 9: Lazy document processing
     * Document content loaded and parsed only when accessed
     */
    private static void demonstrateDocumentProcessing() {
        System.out.println("--- Scenario 9: Document Processing Lazy Loading ---");

        LazyDocument doc = new LazyDocument("contract.pdf", "/docs/contract.pdf");
        System.out.println("Document reference created");

        // Metadata available without loading content
        System.out.println("File: " + doc.getFileName());
        System.out.println("Size: " + doc.getFileSize() + " bytes");

        // Content loaded only when parsed
        String summary = doc.getParsedContent();
        System.out.println("Content parsed: " + summary);

        System.out.println();
    }

    /**
     * Scenario 10: Lazy API client initialization
     * API client initialized only when first request is made
     */
    private static void demonstrateApiClientInitialization() {
        System.out.println("--- Scenario 10: API Client Lazy Initialization ---");

        LazyApiClient client = new LazyApiClient("https://api.example.com");
        System.out.println("API client created (not connected)");

        // Connection established on first request
        String response1 = client.get("/users/1");
        System.out.println("Response: " + response1);

        // Subsequent requests use same connection
        String response2 = client.get("/users/2");
        System.out.println("Response: " + response2);

        System.out.println();
    }
}

// ============= Scenario 1: Database Record Lazy Loading =============

/**
 * Lazy loading employee with details loaded on demand
 */
class LazyEmployee {
    private int id;
    private String name;
    private EmployeeDetails details; // Loaded lazily

    public LazyEmployee(int id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getName() {
        return name;
    }

    /**
     * Lazy loading of employee details
     */
    public EmployeeDetails getDetails() {
        if (details == null) {
            System.out.println("  [Loading employee details from database...]");
            details = loadDetailsFromDatabase();
        }
        return details;
    }

    private EmployeeDetails loadDetailsFromDatabase() {
        // Simulate database call
        try { Thread.sleep(200); } catch (InterruptedException e) {}
        return new EmployeeDetails("Engineering", "Senior Developer", 95000);
    }
}

/**
 * Employee details data class
 */
class EmployeeDetails {
    private String department;
    private String position;
    private double salary;

    public EmployeeDetails(String department, String position, double salary) {
        this.department = department;
        this.position = position;
        this.salary = salary;
    }

    public String getDepartment() { return department; }
    public String getPosition() { return position; }
    public double getSalary() { return salary; }
}

// ============= Scenario 2: Image Gallery Lazy Loading =============

/**
 * Lazy loading image that loads data only when displayed
 */
class LazyImage {
    private String name;
    private String path;
    private byte[] imageData; // Loaded lazily

    public LazyImage(String name, String path) {
        this.name = name;
        this.path = path;
    }

    /**
     * Loads image data from disk/network lazily
     */
    public void display() {
        if (imageData == null) {
            System.out.println("  [Loading image: " + name + " from " + path + "]");
            loadImageData();
        }
        System.out.println("  [Displaying image: " + name + "]");
    }

    private void loadImageData() {
        // Simulate loading image from disk
        try { Thread.sleep(100); } catch (InterruptedException e) {}
        imageData = new byte[1024 * 100]; // Simulate 100KB image
    }
}

/**
 * Image gallery managing multiple lazy images
 */
class ImageGallery {
    private List<LazyImage> images = new ArrayList<>();

    public void addImage(LazyImage image) {
        images.add(image);
    }

    public void displayImage(int index) {
        if (index >= 0 && index < images.size()) {
            images.get(index).display();
        }
    }
}

// ============= Scenario 3: Configuration Lazy Loading =============

/**
 * Application configuration with lazy loading
 */
class ApplicationConfig {
    private Map<String, String> settings;

    /**
     * Lazy loads configuration on first access
     */
    public String get(String key) {
        if (settings == null) {
            System.out.println("  [Loading configuration file...]");
            loadConfiguration();
        }
        return settings.getOrDefault(key, "NOT_FOUND");
    }

    private void loadConfiguration() {
        // Simulate loading from file
        try { Thread.sleep(150); } catch (InterruptedException e) {}
        settings = new HashMap<>();
        settings.put("database.url", "jdbc:postgresql://localhost:5432/mydb");
        settings.put("api.key", "sk_test_abc123xyz");
        settings.put("app.name", "MyApplication");
    }
}

// ============= Scenario 4: User Profile Lazy Loading =============

/**
 * User profile with lazy loading of data
 */
class LazyUserProfile {
    private String userId;
    private UserData userData;
    private Map<String, String> preferences;

    public LazyUserProfile(String userId) {
        this.userId = userId;
    }

    /**
     * Lazy loads user data on first access
     */
    public String getEmail() {
        if (userData == null) {
            System.out.println("  [Loading user data for: " + userId + "]");
            loadUserData();
        }
        return userData.email;
    }

    /**
     * Lazy loads preferences separately
     */
    public Map<String, String> getPreferences() {
        if (preferences == null) {
            System.out.println("  [Loading user preferences...]");
            loadPreferences();
        }
        return preferences;
    }

    private void loadUserData() {
        try { Thread.sleep(100); } catch (InterruptedException e) {}
        userData = new UserData("john@example.com", "John", "Doe");
    }

    private void loadPreferences() {
        try { Thread.sleep(80); } catch (InterruptedException e) {}
        preferences = new HashMap<>();
        preferences.put("theme", "dark");
        preferences.put("language", "en");
    }

    static class UserData {
        String email, firstName, lastName;
        UserData(String email, String firstName, String lastName) {
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
        }
    }
}

// ============= Scenario 5: Report Data Lazy Loading =============

/**
 * Lazy loading report with expensive data generation
 */
class LazyReport {
    private String reportName;
    private Supplier<String> dataGenerator;
    private String reportData;

    public LazyReport(String reportName, Supplier<String> dataGenerator) {
        this.reportName = reportName;
        this.dataGenerator = dataGenerator;
    }

    /**
     * Generates report data lazily on first access
     */
    public String getData() {
        if (reportData == null) {
            reportData = dataGenerator.get();
        }
        return reportData;
    }

    public String getReportName() {
        return reportName;
    }
}

// ============= Scenario 6: Cache Lazy Initialization =============

/**
 * Cache manager with lazy initialization
 */
class LazyCacheManager<K, V> {
    private Map<K, V> cache;

    /**
     * Initializes cache lazily on first put/get
     */
    private void ensureInitialized() {
        if (cache == null) {
            System.out.println("  [Initializing cache system...]");
            cache = new ConcurrentHashMap<>();
        }
    }

    public void put(K key, V value) {
        ensureInitialized();
        cache.put(key, value);
    }

    public V get(K key) {
        ensureInitialized();
        return cache.get(key);
    }
}

class User {
    private String name;
    public User(String name) { this.name = name; }
    @Override
    public String toString() { return "User[" + name + "]"; }
}

// ============= Scenario 7: Plugin System Lazy Loading =============

/**
 * Plugin manager with lazy loading of plugins
 */
class PluginManager {
    private Map<String, Supplier<Plugin>> pluginFactories = new HashMap<>();
    private Map<String, Plugin> loadedPlugins = new HashMap<>();

    public void registerPlugin(String name, Supplier<Plugin> factory) {
        pluginFactories.put(name, factory);
    }

    /**
     * Loads plugin lazily when first requested
     */
    public Plugin getPlugin(String name) {
        if (!loadedPlugins.containsKey(name)) {
            System.out.println("  [Loading plugin: " + name + "]");
            Supplier<Plugin> factory = pluginFactories.get(name);
            if (factory != null) {
                loadedPlugins.put(name, factory.get());
            }
        }
        return loadedPlugins.get(name);
    }
}

/**
 * Plugin interface
 */
interface Plugin {
    void execute();
}

class PdfExportPlugin implements Plugin {
    public void execute() {
        System.out.println("  → Exporting to PDF...");
    }
}

class EmailSenderPlugin implements Plugin {
    public void execute() {
        System.out.println("  → Sending email...");
    }
}

class ImageProcessorPlugin implements Plugin {
    public void execute() {
        System.out.println("  → Processing image...");
    }
}

// ============= Scenario 8: Collection Lazy Loading =============

/**
 * Lazy loading collection that loads data in pages
 */
class LazyProductCollection {
    private String category;
    private Map<Integer, List<Product>> loadedPages = new HashMap<>();
    private Integer totalCount;

    public LazyProductCollection(String category) {
        this.category = category;
    }

    /**
     * Loads a specific page lazily
     */
    public List<Product> getPage(int pageNumber, int pageSize) {
        if (!loadedPages.containsKey(pageNumber)) {
            System.out.println("  [Loading page " + pageNumber + " from database...]");
            loadedPages.put(pageNumber, loadPageFromDatabase(pageNumber, pageSize));
        }
        return loadedPages.get(pageNumber);
    }

    /**
     * Gets total count without loading all data
     */
    public int getTotalCount() {
        if (totalCount == null) {
            System.out.println("  [Fetching count only...]");
            totalCount = 47; // Simulate count query
        }
        return totalCount;
    }

    private List<Product> loadPageFromDatabase(int pageNumber, int pageSize) {
        try { Thread.sleep(150); } catch (InterruptedException e) {}
        List<Product> products = new ArrayList<>();
        for (int i = 0; i < pageSize; i++) {
            products.add(new Product("Product " + (pageNumber * pageSize + i + 1), 99.99));
        }
        return products;
    }
}

class Product {
    private String name;
    private double price;

    public Product(String name, double price) {
        this.name = name;
        this.price = price;
    }
}

// ============= Scenario 9: Document Processing Lazy Loading =============

/**
 * Lazy loading document with on-demand parsing
 */
class LazyDocument {
    private String fileName;
    private String filePath;
    private String parsedContent;
    private long fileSize;

    public LazyDocument(String fileName, String filePath) {
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileSize = 524288; // 512KB
    }

    public String getFileName() {
        return fileName;
    }

    public long getFileSize() {
        return fileSize;
    }

    /**
     * Parses document content lazily
     */
    public String getParsedContent() {
        if (parsedContent == null) {
            System.out.println("  [Loading and parsing document...]");
            parseDocument();
        }
        return parsedContent;
    }

    private void parseDocument() {
        try { Thread.sleep(300); } catch (InterruptedException e) {}
        parsedContent = "Contract Agreement - Terms and Conditions apply";
    }
}

// ============= Scenario 10: API Client Lazy Initialization =============

/**
 * API client with lazy connection initialization
 */
class LazyApiClient {
    private String baseUrl;
    private HttpConnection connection;

    public LazyApiClient(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     * Initializes connection lazily on first request
     */
    private void ensureConnected() {
        if (connection == null) {
            System.out.println("  [Establishing API connection to: " + baseUrl + "]");
            connection = new HttpConnection(baseUrl);
        }
    }

    public String get(String endpoint) {
        ensureConnected();
        return connection.request("GET", endpoint);
    }

    public String post(String endpoint, String data) {
        ensureConnected();
        return connection.request("POST", endpoint);
    }
}

/**
 * Simulated HTTP connection
 */
class HttpConnection {
    private String baseUrl;

    public HttpConnection(String baseUrl) {
        try { Thread.sleep(200); } catch (InterruptedException e) {}
        this.baseUrl = baseUrl;
    }

    public String request(String method, String endpoint) {
        return "{\"status\": \"success\", \"data\": {...}}";
    }
}
