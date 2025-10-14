package Enterprise.Base.Registry;

import java.sql.Connection;
import java.sql.DriverManager;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import javax.sql.DataSource;

/**
 * Registry Pattern Demonstration
 *
 * Intent: A well-known object that other objects can use to find common objects and services
 *
 * Use When:
 * - You need a global point of access for objects/services
 * - You want to avoid passing dependencies through multiple layers
 * - You need to decouple object creation from usage
 * - You want to manage singleton-like objects without static fields
 *
 * Enterprise Context:
 * Registries are commonly used for configuration, data sources, services, and
 * shared resources in enterprise applications. They provide controlled access
 * to resources without tight coupling.
 */
public class Main {

    /**
     * Base Registry Interface
     * All specialized registries implement this
     */
    interface Registry {
        void register(String key, Object value);
        <T> T lookup(String key, Class<T> type);
        void unregister(String key);
        boolean contains(String key);
        Set<String> keys();
    }

    /**
     * Simple Registry Implementation
     * Thread-safe registry for general-purpose use
     */
    static class SimpleRegistry implements Registry {
        private final Map<String, Object> registry = new ConcurrentHashMap<>();

        @Override
        public void register(String key, Object value) {
            if (key == null || value == null) {
                throw new IllegalArgumentException("Key and value cannot be null");
            }
            registry.put(key, value);
            System.out.println("Registered: " + key + " -> " + value.getClass().getSimpleName());
        }

        @Override
        @SuppressWarnings("unchecked")
        public <T> T lookup(String key, Class<T> type) {
            Object value = registry.get(key);
            if (value == null) {
                return null;
            }
            if (!type.isInstance(value)) {
                throw new ClassCastException("Object " + key + " is not of type " + type.getName());
            }
            return (T) value;
        }

        @Override
        public void unregister(String key) {
            Object removed = registry.remove(key);
            if (removed != null) {
                System.out.println("Unregistered: " + key);
            }
        }

        @Override
        public boolean contains(String key) {
            return registry.containsKey(key);
        }

        @Override
        public Set<String> keys() {
            return new HashSet<>(registry.keySet());
        }
    }

    /**
     * Singleton Registry Holder
     * Provides global access to the registry
     */
    static class RegistryHolder {
        private static final Registry instance = new SimpleRegistry();

        public static Registry getInstance() {
            return instance;
        }

        private RegistryHolder() {
            // Prevent instantiation
        }
    }

    /**
     * Configuration Registry
     * Specialized registry for application configuration
     */
    static class ConfigurationRegistry {
        private static final Map<String, String> config = new ConcurrentHashMap<>();
        private static final Map<String, Object> typedConfig = new ConcurrentHashMap<>();

        public static void set(String key, String value) {
            config.put(key, value);
            System.out.println("Config set: " + key + " = " + value);
        }

        public static String get(String key) {
            return config.get(key);
        }

        public static String get(String key, String defaultValue) {
            return config.getOrDefault(key, defaultValue);
        }

        public static int getInt(String key, int defaultValue) {
            String value = config.get(key);
            return value != null ? Integer.parseInt(value) : defaultValue;
        }

        public static boolean getBoolean(String key, boolean defaultValue) {
            String value = config.get(key);
            return value != null ? Boolean.parseBoolean(value) : defaultValue;
        }

        public static <T> void setTyped(String key, T value) {
            typedConfig.put(key, value);
            System.out.println("Typed config set: " + key + " -> " + value.getClass().getSimpleName());
        }

        @SuppressWarnings("unchecked")
        public static <T> T getTyped(String key, Class<T> type) {
            Object value = typedConfig.get(key);
            if (value != null && type.isInstance(value)) {
                return (T) value;
            }
            return null;
        }

        public static void loadFromProperties(Properties props) {
            props.forEach((key, value) -> config.put(key.toString(), value.toString()));
            System.out.println("Loaded " + props.size() + " properties");
        }

        public static Map<String, String> getAll() {
            return new HashMap<>(config);
        }
    }

    /**
     * Data Source Registry
     * Manages database connections and data sources
     */
    static class DataSourceRegistry {
        private static final Map<String, DataSourceConfig> dataSources = new ConcurrentHashMap<>();
        private static String defaultDataSourceName = "default";

        static class DataSourceConfig {
            private final String url;
            private final String username;
            private final String password;
            private final String driver;

            public DataSourceConfig(String url, String username, String password, String driver) {
                this.url = url;
                this.username = username;
                this.password = password;
                this.driver = driver;
            }

            public String getUrl() { return url; }
            public String getUsername() { return username; }
            public String getPassword() { return password; }
            public String getDriver() { return driver; }
        }

        public static void registerDataSource(String name, String url, String username,
                                             String password, String driver) {
            DataSourceConfig config = new DataSourceConfig(url, username, password, driver);
            dataSources.put(name, config);
            System.out.println("Registered data source: " + name);
        }

        public static void setDefaultDataSource(String name) {
            if (!dataSources.containsKey(name)) {
                throw new IllegalArgumentException("Data source not found: " + name);
            }
            defaultDataSourceName = name;
            System.out.println("Default data source set to: " + name);
        }

        public static DataSourceConfig getDataSource(String name) {
            return dataSources.get(name);
        }

        public static DataSourceConfig getDefaultDataSource() {
            return dataSources.get(defaultDataSourceName);
        }

        public static Connection getConnection(String name) throws Exception {
            DataSourceConfig config = dataSources.get(name);
            if (config == null) {
                throw new IllegalArgumentException("Data source not found: " + name);
            }
            Class.forName(config.getDriver());
            return DriverManager.getConnection(config.getUrl(), config.getUsername(),
                                              config.getPassword());
        }

        public static Set<String> getDataSourceNames() {
            return new HashSet<>(dataSources.keySet());
        }
    }

    /**
     * Service Registry
     * Manages application services
     */
    static class ServiceRegistry {
        private static final Map<Class<?>, Object> services = new ConcurrentHashMap<>();
        private static final Map<String, Object> namedServices = new ConcurrentHashMap<>();

        public static <T> void registerService(Class<T> serviceClass, T service) {
            services.put(serviceClass, service);
            System.out.println("Registered service: " + serviceClass.getSimpleName());
        }

        public static <T> void registerService(String name, T service) {
            namedServices.put(name, service);
            System.out.println("Registered named service: " + name);
        }

        @SuppressWarnings("unchecked")
        public static <T> T getService(Class<T> serviceClass) {
            Object service = services.get(serviceClass);
            if (service == null) {
                throw new IllegalStateException("Service not found: " + serviceClass.getName());
            }
            return (T) service;
        }

        @SuppressWarnings("unchecked")
        public static <T> T getService(String name, Class<T> serviceClass) {
            Object service = namedServices.get(name);
            if (service == null) {
                throw new IllegalStateException("Named service not found: " + name);
            }
            if (!serviceClass.isInstance(service)) {
                throw new ClassCastException("Service " + name + " is not of type " +
                                           serviceClass.getName());
            }
            return (T) service;
        }

        public static boolean hasService(Class<?> serviceClass) {
            return services.containsKey(serviceClass);
        }

        public static boolean hasService(String name) {
            return namedServices.containsKey(name);
        }

        public static void unregisterService(Class<?> serviceClass) {
            services.remove(serviceClass);
            System.out.println("Unregistered service: " + serviceClass.getSimpleName());
        }

        public static void unregisterService(String name) {
            namedServices.remove(name);
            System.out.println("Unregistered named service: " + name);
        }
    }

    // Sample Services for demonstration

    /**
     * Email Service
     */
    interface EmailService {
        void sendEmail(String to, String subject, String body);
        int getEmailsSent();
    }

    static class SmtpEmailService implements EmailService {
        private int emailsSent = 0;

        @Override
        public void sendEmail(String to, String subject, String body) {
            System.out.println("Sending email to " + to + ": " + subject);
            emailsSent++;
        }

        @Override
        public int getEmailsSent() {
            return emailsSent;
        }
    }

    /**
     * Payment Service
     */
    interface PaymentService {
        boolean processPayment(String accountId, double amount);
        double getTotalProcessed();
    }

    static class StripePaymentService implements PaymentService {
        private double totalProcessed = 0.0;

        @Override
        public boolean processPayment(String accountId, double amount) {
            System.out.println("Processing $" + amount + " payment for account " + accountId);
            totalProcessed += amount;
            return true;
        }

        @Override
        public double getTotalProcessed() {
            return totalProcessed;
        }
    }

    static class PayPalPaymentService implements PaymentService {
        private double totalProcessed = 0.0;

        @Override
        public boolean processPayment(String accountId, double amount) {
            System.out.println("Processing PayPal payment $" + amount + " for " + accountId);
            totalProcessed += amount;
            return true;
        }

        @Override
        public double getTotalProcessed() {
            return totalProcessed;
        }
    }

    /**
     * Cache Service
     */
    interface CacheService {
        void put(String key, Object value);
        Object get(String key);
        void invalidate(String key);
        int size();
    }

    static class MemoryCacheService implements CacheService {
        private final Map<String, Object> cache = new ConcurrentHashMap<>();

        @Override
        public void put(String key, Object value) {
            cache.put(key, value);
            System.out.println("Cached: " + key);
        }

        @Override
        public Object get(String key) {
            return cache.get(key);
        }

        @Override
        public void invalidate(String key) {
            cache.remove(key);
            System.out.println("Invalidated cache: " + key);
        }

        @Override
        public int size() {
            return cache.size();
        }
    }

    /**
     * Logger Service
     */
    static class LoggerService {
        private final List<String> logs = Collections.synchronizedList(new ArrayList<>());

        public void info(String message) {
            String log = "[INFO] " + message;
            logs.add(log);
            System.out.println(log);
        }

        public void error(String message) {
            String log = "[ERROR] " + message;
            logs.add(log);
            System.out.println(log);
        }

        public void warn(String message) {
            String log = "[WARN] " + message;
            logs.add(log);
            System.out.println(log);
        }

        public List<String> getLogs() {
            return new ArrayList<>(logs);
        }

        public int getLogCount() {
            return logs.size();
        }
    }

    /**
     * Application Context - combines multiple registries
     */
    static class ApplicationContext {
        private static ApplicationContext instance;
        private final Registry registry;
        private boolean initialized = false;

        private ApplicationContext() {
            this.registry = new SimpleRegistry();
        }

        public static synchronized ApplicationContext getInstance() {
            if (instance == null) {
                instance = new ApplicationContext();
            }
            return instance;
        }

        public void initialize() {
            if (initialized) {
                System.out.println("Application context already initialized");
                return;
            }

            System.out.println("Initializing application context...");

            // Register core services
            ServiceRegistry.registerService(EmailService.class, new SmtpEmailService());
            ServiceRegistry.registerService(LoggerService.class, new LoggerService());
            ServiceRegistry.registerService(CacheService.class, new MemoryCacheService());

            // Register payment services by name
            ServiceRegistry.registerService("stripe", new StripePaymentService());
            ServiceRegistry.registerService("paypal", new PayPalPaymentService());

            // Set configuration
            ConfigurationRegistry.set("app.name", "Enterprise Application");
            ConfigurationRegistry.set("app.version", "1.0.0");
            ConfigurationRegistry.set("app.environment", "production");
            ConfigurationRegistry.set("app.maxConnections", "100");
            ConfigurationRegistry.set("app.enableCache", "true");

            // Register data sources
            DataSourceRegistry.registerDataSource("default",
                "jdbc:postgresql://localhost:5432/maindb",
                "admin", "password", "org.postgresql.Driver");

            DataSourceRegistry.registerDataSource("analytics",
                "jdbc:postgresql://localhost:5432/analyticsdb",
                "analyst", "password", "org.postgresql.Driver");

            initialized = true;
            System.out.println("Application context initialized successfully");
        }

        public Registry getRegistry() {
            return registry;
        }

        public boolean isInitialized() {
            return initialized;
        }

        public void shutdown() {
            System.out.println("Shutting down application context...");
            initialized = false;
            System.out.println("Application context shut down");
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Registry Pattern Demo ===\n");

        // Scenario 1: Basic Registry Operations
        System.out.println("--- Scenario 1: Basic Registry ---");
        Registry registry = RegistryHolder.getInstance();
        registry.register("appName", "MyApp");
        registry.register("version", "1.0");
        registry.register("maxUsers", 1000);

        String appName = registry.lookup("appName", String.class);
        Integer maxUsers = registry.lookup("maxUsers", Integer.class);
        System.out.println("App: " + appName + ", Max Users: " + maxUsers);
        System.out.println("Contains 'version': " + registry.contains("version"));

        // Scenario 2: Configuration Registry
        System.out.println("\n--- Scenario 2: Configuration Registry ---");
        ConfigurationRegistry.set("database.host", "localhost");
        ConfigurationRegistry.set("database.port", "5432");
        ConfigurationRegistry.set("cache.ttl", "3600");
        ConfigurationRegistry.set("feature.newUI", "true");

        String dbHost = ConfigurationRegistry.get("database.host");
        int dbPort = ConfigurationRegistry.getInt("database.port", 5432);
        boolean newUI = ConfigurationRegistry.getBoolean("feature.newUI", false);

        System.out.println("Database: " + dbHost + ":" + dbPort);
        System.out.println("New UI enabled: " + newUI);

        // Scenario 3: Load Configuration from Properties
        System.out.println("\n--- Scenario 3: Properties Loading ---");
        Properties props = new Properties();
        props.setProperty("smtp.host", "mail.example.com");
        props.setProperty("smtp.port", "587");
        props.setProperty("smtp.tls", "true");
        ConfigurationRegistry.loadFromProperties(props);

        System.out.println("SMTP Host: " + ConfigurationRegistry.get("smtp.host"));

        // Scenario 4: Service Registry
        System.out.println("\n--- Scenario 4: Service Registration ---");
        EmailService emailService = new SmtpEmailService();
        ServiceRegistry.registerService(EmailService.class, emailService);

        LoggerService logger = new LoggerService();
        ServiceRegistry.registerService(LoggerService.class, logger);

        // Scenario 5: Service Lookup and Usage
        System.out.println("\n--- Scenario 5: Service Usage ---");
        EmailService retrievedEmailService = ServiceRegistry.getService(EmailService.class);
        retrievedEmailService.sendEmail("user@example.com", "Welcome", "Welcome to our app!");
        retrievedEmailService.sendEmail("admin@example.com", "Alert", "System alert");

        LoggerService retrievedLogger = ServiceRegistry.getService(LoggerService.class);
        retrievedLogger.info("Application started");
        retrievedLogger.warn("High memory usage detected");

        System.out.println("Total emails sent: " + retrievedEmailService.getEmailsSent());
        System.out.println("Total logs: " + retrievedLogger.getLogCount());

        // Scenario 6: Named Services
        System.out.println("\n--- Scenario 6: Named Service Registry ---");
        PaymentService stripeService = new StripePaymentService();
        PaymentService paypalService = new PayPalPaymentService();

        ServiceRegistry.registerService("stripe", stripeService);
        ServiceRegistry.registerService("paypal", paypalService);

        PaymentService stripe = ServiceRegistry.getService("stripe", PaymentService.class);
        stripe.processPayment("ACC-001", 99.99);
        stripe.processPayment("ACC-002", 149.99);

        PaymentService paypal = ServiceRegistry.getService("paypal", PaymentService.class);
        paypal.processPayment("ACC-003", 75.00);

        System.out.println("Stripe total: $" + stripe.getTotalProcessed());
        System.out.println("PayPal total: $" + paypal.getTotalProcessed());

        // Scenario 7: Data Source Registry
        System.out.println("\n--- Scenario 7: Data Source Registry ---");
        DataSourceRegistry.registerDataSource("primary",
            "jdbc:postgresql://localhost:5432/maindb",
            "admin", "secret", "org.postgresql.Driver");

        DataSourceRegistry.registerDataSource("reporting",
            "jdbc:postgresql://localhost:5432/reportdb",
            "reporter", "secret", "org.postgresql.Driver");

        DataSourceRegistry.setDefaultDataSource("primary");

        DataSourceRegistry.DataSourceConfig primaryDs = DataSourceRegistry.getDefaultDataSource();
        System.out.println("Default data source URL: " + primaryDs.getUrl());

        Set<String> dsNames = DataSourceRegistry.getDataSourceNames();
        System.out.println("Available data sources: " + dsNames);

        // Scenario 8: Cache Service
        System.out.println("\n--- Scenario 8: Cache Service ---");
        CacheService cache = new MemoryCacheService();
        ServiceRegistry.registerService(CacheService.class, cache);

        CacheService retrievedCache = ServiceRegistry.getService(CacheService.class);
        retrievedCache.put("user:1", "John Doe");
        retrievedCache.put("user:2", "Jane Smith");
        retrievedCache.put("session:abc123", "active");

        System.out.println("Cached user:1 = " + retrievedCache.get("user:1"));
        System.out.println("Cache size: " + retrievedCache.size());

        retrievedCache.invalidate("user:1");
        System.out.println("After invalidation, cache size: " + retrievedCache.size());

        // Scenario 9: Application Context
        System.out.println("\n--- Scenario 9: Application Context ---");
        ApplicationContext context = ApplicationContext.getInstance();
        context.initialize();

        EmailService contextEmail = ServiceRegistry.getService(EmailService.class);
        contextEmail.sendEmail("test@example.com", "Test", "Context test");

        String environment = ConfigurationRegistry.get("app.environment");
        System.out.println("Running in environment: " + environment);

        // Scenario 10: Typed Configuration
        System.out.println("\n--- Scenario 10: Typed Configuration ---");
        List<String> allowedHosts = Arrays.asList("localhost", "example.com", "api.example.com");
        ConfigurationRegistry.setTyped("allowed.hosts", allowedHosts);

        Map<String, Integer> rateLimits = new HashMap<>();
        rateLimits.put("api", 1000);
        rateLimits.put("web", 10000);
        ConfigurationRegistry.setTyped("rate.limits", rateLimits);

        @SuppressWarnings("unchecked")
        List<String> retrievedHosts = ConfigurationRegistry.getTyped("allowed.hosts", List.class);
        @SuppressWarnings("unchecked")
        Map<String, Integer> retrievedLimits = ConfigurationRegistry.getTyped("rate.limits", Map.class);

        System.out.println("Allowed hosts: " + retrievedHosts);
        System.out.println("Rate limits: " + retrievedLimits);

        // Scenario 11: Service Verification
        System.out.println("\n--- Scenario 11: Service Verification ---");
        System.out.println("Has EmailService: " + ServiceRegistry.hasService(EmailService.class));
        System.out.println("Has stripe: " + ServiceRegistry.hasService("stripe"));
        System.out.println("Has paypal: " + ServiceRegistry.hasService("paypal"));

        // Summary
        System.out.println("\n--- Summary ---");
        System.out.println("Registry keys: " + registry.keys().size());
        System.out.println("Configuration entries: " + ConfigurationRegistry.getAll().size());
        System.out.println("Application initialized: " + context.isInitialized());

        // Cleanup
        System.out.println("\n--- Cleanup ---");
        context.shutdown();

        System.out.println("\n=== Benefits of Registry Pattern ===");
        System.out.println("1. Centralized access to shared resources");
        System.out.println("2. Decouples object creation from usage");
        System.out.println("3. Makes dependencies explicit and manageable");
        System.out.println("4. Simplifies testing through service substitution");
        System.out.println("5. Provides single point for configuration management");

        System.out.println("\nPattern demonstration complete.");
    }
}
