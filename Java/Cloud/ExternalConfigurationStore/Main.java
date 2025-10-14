package Cloud.ExternalConfigurationStore;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.time.Instant;
import java.util.function.Consumer;

/**
 * ExternalConfigurationStore Pattern Demonstration
 *
 * This pattern moves configuration information out of the application deployment package
 * to a centralized location. This provides advantages for managing and controlling
 * configuration data, and for sharing configuration across applications and instances.
 * It demonstrates:
 * - Centralized configuration management
 * - Environment-specific configurations
 * - Dynamic configuration updates without redeployment
 * - Configuration versioning and history
 * - Secure configuration storage
 * - Configuration validation
 * - Multi-tenant configuration isolation
 * - Configuration change notifications
 *
 * Key Benefits:
 * - Centralized management
 * - Environment independence
 * - Dynamic updates
 * - Configuration sharing
 *
 * @author Design Patterns Collection
 * @version 2.0
 */
public class Main {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== ExternalConfigurationStore Pattern Demo ===\n");

        // Scenario 1: Basic External Configuration
        demonstrateBasicConfiguration();

        // Scenario 2: Environment-Specific Configuration
        demonstrateEnvironmentConfiguration();

        // Scenario 3: Dynamic Configuration Updates
        demonstrateDynamicUpdates();

        // Scenario 4: Configuration Versioning
        demonstrateVersioning();

        // Scenario 5: Secure Configuration Storage
        demonstrateSecureStorage();

        // Scenario 6: Configuration Validation
        demonstrateValidation();

        // Scenario 7: Multi-Tenant Configuration
        demonstrateMultiTenant();

        // Scenario 8: Configuration Change Notifications
        demonstrateChangeNotifications();

        // Scenario 9: Async Configuration Loading
        demonstrateAsyncLoading();

        // Scenario 10: Configuration Caching with TTL
        demonstrateCaching();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Demonstrates basic external configuration storage and retrieval
     */
    private static void demonstrateBasicConfiguration() {
        System.out.println("Scenario 1: Basic External Configuration");
        System.out.println("----------------------------------------");

        ConfigurationStore store = new ConfigurationStore();

        // Store configurations
        store.setConfig("app.name", "MyApplication");
        store.setConfig("app.version", "1.0.0");
        store.setConfig("database.url", "jdbc:mysql://localhost:3306/mydb");
        store.setConfig("database.maxConnections", "50");

        // Retrieve configurations
        System.out.println("App Name: " + store.getConfig("app.name"));
        System.out.println("Version: " + store.getConfig("app.version"));
        System.out.println("DB URL: " + store.getConfig("database.url"));
        System.out.println("Max Connections: " + store.getConfig("database.maxConnections"));
        System.out.println();
    }

    /**
     * Scenario 2: Demonstrates environment-specific configurations
     */
    private static void demonstrateEnvironmentConfiguration() {
        System.out.println("Scenario 2: Environment-Specific Configuration");
        System.out.println("----------------------------------------------");

        EnvironmentConfigStore envStore = new EnvironmentConfigStore();

        // Set configs for different environments
        envStore.setConfig(Environment.DEVELOPMENT, "database.url", "jdbc:mysql://dev-db:3306/mydb");
        envStore.setConfig(Environment.STAGING, "database.url", "jdbc:mysql://staging-db:3306/mydb");
        envStore.setConfig(Environment.PRODUCTION, "database.url", "jdbc:mysql://prod-db:3306/mydb");

        envStore.setConfig(Environment.DEVELOPMENT, "log.level", "DEBUG");
        envStore.setConfig(Environment.PRODUCTION, "log.level", "ERROR");

        // Retrieve environment-specific configs
        System.out.println("Dev DB: " + envStore.getConfig(Environment.DEVELOPMENT, "database.url"));
        System.out.println("Prod DB: " + envStore.getConfig(Environment.PRODUCTION, "database.url"));
        System.out.println("Dev Log Level: " + envStore.getConfig(Environment.DEVELOPMENT, "log.level"));
        System.out.println("Prod Log Level: " + envStore.getConfig(Environment.PRODUCTION, "log.level"));
        System.out.println();
    }

    /**
     * Scenario 3: Demonstrates dynamic configuration updates without restart
     */
    private static void demonstrateDynamicUpdates() throws InterruptedException {
        System.out.println("Scenario 3: Dynamic Configuration Updates");
        System.out.println("-----------------------------------------");

        DynamicConfigStore dynamicStore = new DynamicConfigStore();
        Application app = new Application(dynamicStore);

        // Initial configuration
        dynamicStore.setConfig("feature.newUI", "false");
        System.out.println("Feature enabled: " + app.isFeatureEnabled("feature.newUI"));

        // Update configuration dynamically
        Thread.sleep(100);
        dynamicStore.setConfig("feature.newUI", "true");
        dynamicStore.notifyListeners("feature.newUI");

        Thread.sleep(100);
        System.out.println("Feature enabled after update: " + app.isFeatureEnabled("feature.newUI"));
        System.out.println();
    }

    /**
     * Scenario 4: Demonstrates configuration versioning
     */
    private static void demonstrateVersioning() {
        System.out.println("Scenario 4: Configuration Versioning");
        System.out.println("------------------------------------");

        VersionedConfigStore versionedStore = new VersionedConfigStore();

        // Update configuration multiple times
        versionedStore.setConfig("api.endpoint", "https://api.example.com/v1");
        versionedStore.setConfig("api.endpoint", "https://api.example.com/v2");
        versionedStore.setConfig("api.endpoint", "https://api.example.com/v3");

        System.out.println("Current: " + versionedStore.getConfig("api.endpoint"));
        System.out.println("Version history:");
        versionedStore.getHistory("api.endpoint").forEach(entry ->
            System.out.println("  v" + entry.getVersion() + ": " + entry.getValue() +
                             " at " + entry.getTimestamp())
        );
        System.out.println();
    }

    /**
     * Scenario 5: Demonstrates secure configuration storage with encryption
     */
    private static void demonstrateSecureStorage() {
        System.out.println("Scenario 5: Secure Configuration Storage");
        System.out.println("----------------------------------------");

        SecureConfigStore secureStore = new SecureConfigStore();

        // Store sensitive configuration
        secureStore.setSecureConfig("database.password", "superSecret123");
        secureStore.setSecureConfig("api.key", "sk_live_abc123xyz789");

        // Retrieve decrypted configuration
        System.out.println("DB Password retrieved: " + secureStore.getSecureConfig("database.password"));
        System.out.println("API Key retrieved: " + secureStore.getSecureConfig("api.key"));
        System.out.println("(Note: Values are encrypted at rest)");
        System.out.println();
    }

    /**
     * Scenario 6: Demonstrates configuration validation
     */
    private static void demonstrateValidation() {
        System.out.println("Scenario 6: Configuration Validation");
        System.out.println("------------------------------------");

        ValidatingConfigStore validatingStore = new ValidatingConfigStore();

        // Add validators
        validatingStore.addValidator("port", value -> {
            try {
                int port = Integer.parseInt(value);
                return port > 0 && port < 65536;
            } catch (NumberFormatException e) {
                return false;
            }
        });

        validatingStore.addValidator("email", value ->
            value.contains("@") && value.contains(".")
        );

        // Test validation
        boolean validPort = validatingStore.setConfig("port", "8080");
        System.out.println("Valid port (8080): " + validPort);

        boolean invalidPort = validatingStore.setConfig("port", "99999");
        System.out.println("Invalid port (99999): " + invalidPort);

        boolean validEmail = validatingStore.setConfig("email", "admin@example.com");
        System.out.println("Valid email: " + validEmail);

        boolean invalidEmail = validatingStore.setConfig("email", "invalid-email");
        System.out.println("Invalid email: " + invalidEmail);
        System.out.println();
    }

    /**
     * Scenario 7: Demonstrates multi-tenant configuration isolation
     */
    private static void demonstrateMultiTenant() {
        System.out.println("Scenario 7: Multi-Tenant Configuration");
        System.out.println("--------------------------------------");

        MultiTenantConfigStore mtStore = new MultiTenantConfigStore();

        // Configure different tenants
        mtStore.setTenantConfig("tenant-A", "theme.color", "blue");
        mtStore.setTenantConfig("tenant-A", "feature.analytics", "true");

        mtStore.setTenantConfig("tenant-B", "theme.color", "green");
        mtStore.setTenantConfig("tenant-B", "feature.analytics", "false");

        // Retrieve tenant-specific configs
        System.out.println("Tenant A theme: " + mtStore.getTenantConfig("tenant-A", "theme.color"));
        System.out.println("Tenant A analytics: " + mtStore.getTenantConfig("tenant-A", "feature.analytics"));
        System.out.println("Tenant B theme: " + mtStore.getTenantConfig("tenant-B", "theme.color"));
        System.out.println("Tenant B analytics: " + mtStore.getTenantConfig("tenant-B", "feature.analytics"));
        System.out.println();
    }

    /**
     * Scenario 8: Demonstrates configuration change notifications
     */
    private static void demonstrateChangeNotifications() throws InterruptedException {
        System.out.println("Scenario 8: Configuration Change Notifications");
        System.out.println("----------------------------------------------");

        ObservableConfigStore observableStore = new ObservableConfigStore();

        // Register listeners
        observableStore.addListener("cache.ttl", (key, oldValue, newValue) ->
            System.out.println("  [Listener] " + key + " changed from " + oldValue + " to " + newValue)
        );

        // Make changes
        observableStore.setConfig("cache.ttl", "300");
        Thread.sleep(50);
        observableStore.setConfig("cache.ttl", "600");
        Thread.sleep(50);
        observableStore.setConfig("cache.ttl", "900");
        Thread.sleep(100);
        System.out.println();
    }

    /**
     * Scenario 9: Demonstrates async configuration loading
     */
    private static void demonstrateAsyncLoading() throws InterruptedException {
        System.out.println("Scenario 9: Async Configuration Loading");
        System.out.println("---------------------------------------");

        AsyncConfigStore asyncStore = new AsyncConfigStore();

        // Load configurations asynchronously
        CompletableFuture<Void> future1 = asyncStore.loadConfigAsync("database.url", "jdbc:mysql://localhost:3306/db");
        CompletableFuture<Void> future2 = asyncStore.loadConfigAsync("api.timeout", "5000");
        CompletableFuture<Void> future3 = asyncStore.loadConfigAsync("cache.enabled", "true");

        CompletableFuture.allOf(future1, future2, future3).join();

        System.out.println("Configurations loaded:");
        System.out.println("  database.url: " + asyncStore.getConfig("database.url"));
        System.out.println("  api.timeout: " + asyncStore.getConfig("api.timeout"));
        System.out.println("  cache.enabled: " + asyncStore.getConfig("cache.enabled"));
        System.out.println();
    }

    /**
     * Scenario 10: Demonstrates configuration caching with TTL
     */
    private static void demonstrateCaching() throws InterruptedException {
        System.out.println("Scenario 10: Configuration Caching with TTL");
        System.out.println("-------------------------------------------");

        CachedConfigStore cachedStore = new CachedConfigStore(200); // 200ms TTL

        // Set initial value
        cachedStore.setConfig("api.rate.limit", "100");
        System.out.println("Initial value: " + cachedStore.getConfig("api.rate.limit"));
        System.out.println("Cache hit: " + cachedStore.getCacheHitCount());

        // Access from cache
        cachedStore.getConfig("api.rate.limit");
        System.out.println("After cache access, hits: " + cachedStore.getCacheHitCount());

        // Wait for TTL expiration
        Thread.sleep(250);
        cachedStore.getConfig("api.rate.limit");
        System.out.println("After TTL expiration, hits: " + cachedStore.getCacheHitCount());
        System.out.println("Cache was refreshed due to TTL expiration");
        System.out.println();
    }
}

/**
 * Enumeration for deployment environments
 */
enum Environment {
    DEVELOPMENT,
    STAGING,
    PRODUCTION
}

/**
 * Basic configuration store
 */
class ConfigurationStore {
    private final Map<String, String> configurations;

    public ConfigurationStore() {
        this.configurations = new ConcurrentHashMap<>();
    }

    public void setConfig(String key, String value) {
        configurations.put(key, value);
    }

    public String getConfig(String key) {
        return configurations.get(key);
    }

    public String getConfig(String key, String defaultValue) {
        return configurations.getOrDefault(key, defaultValue);
    }

    public Map<String, String> getAllConfigs() {
        return new HashMap<>(configurations);
    }
}

/**
 * Environment-specific configuration store
 */
class EnvironmentConfigStore {
    private final Map<Environment, Map<String, String>> environmentConfigs;

    public EnvironmentConfigStore() {
        this.environmentConfigs = new ConcurrentHashMap<>();
        for (Environment env : Environment.values()) {
            environmentConfigs.put(env, new ConcurrentHashMap<>());
        }
    }

    public void setConfig(Environment environment, String key, String value) {
        environmentConfigs.get(environment).put(key, value);
    }

    public String getConfig(Environment environment, String key) {
        return environmentConfigs.get(environment).get(key);
    }

    public String getConfig(Environment environment, String key, String defaultValue) {
        return environmentConfigs.get(environment).getOrDefault(key, defaultValue);
    }
}

/**
 * Dynamic configuration store with change detection
 */
class DynamicConfigStore extends ConfigurationStore {
    private final List<Consumer<String>> changeListeners;

    public DynamicConfigStore() {
        super();
        this.changeListeners = new CopyOnWriteArrayList<>();
    }

    public void addChangeListener(Consumer<String> listener) {
        changeListeners.add(listener);
    }

    public void notifyListeners(String key) {
        changeListeners.forEach(listener -> listener.accept(key));
    }
}

/**
 * Application that uses dynamic configuration
 */
class Application {
    private final DynamicConfigStore configStore;

    public Application(DynamicConfigStore configStore) {
        this.configStore = configStore;

        // Listen for configuration changes
        configStore.addChangeListener(key -> {
            System.out.println("  [App] Configuration changed: " + key);
        });
    }

    public boolean isFeatureEnabled(String featureKey) {
        String value = configStore.getConfig(featureKey, "false");
        return "true".equalsIgnoreCase(value);
    }
}

/**
 * Configuration entry with version information
 */
class ConfigEntry {
    private final String value;
    private final int version;
    private final Instant timestamp;

    public ConfigEntry(String value, int version, Instant timestamp) {
        this.value = value;
        this.version = version;
        this.timestamp = timestamp;
    }

    public String getValue() { return value; }
    public int getVersion() { return version; }
    public Instant getTimestamp() { return timestamp; }
}

/**
 * Versioned configuration store with history
 */
class VersionedConfigStore {
    private final Map<String, List<ConfigEntry>> configHistory;
    private final Map<String, AtomicInteger> versionCounters;

    public VersionedConfigStore() {
        this.configHistory = new ConcurrentHashMap<>();
        this.versionCounters = new ConcurrentHashMap<>();
    }

    public void setConfig(String key, String value) {
        versionCounters.putIfAbsent(key, new AtomicInteger(0));
        int version = versionCounters.get(key).incrementAndGet();

        ConfigEntry entry = new ConfigEntry(value, version, Instant.now());

        configHistory.computeIfAbsent(key, k ->
            Collections.synchronizedList(new ArrayList<>())
        ).add(entry);
    }

    public String getConfig(String key) {
        List<ConfigEntry> history = configHistory.get(key);
        if (history != null && !history.isEmpty()) {
            return history.get(history.size() - 1).getValue();
        }
        return null;
    }

    public List<ConfigEntry> getHistory(String key) {
        return new ArrayList<>(configHistory.getOrDefault(key, Collections.emptyList()));
    }

    public String getVersion(String key, int version) {
        List<ConfigEntry> history = configHistory.get(key);
        if (history != null) {
            return history.stream()
                .filter(entry -> entry.getVersion() == version)
                .findFirst()
                .map(ConfigEntry::getValue)
                .orElse(null);
        }
        return null;
    }
}

/**
 * Secure configuration store with encryption
 */
class SecureConfigStore {
    private final Map<String, String> encryptedConfigs;
    private final String encryptionKey;

    public SecureConfigStore() {
        this.encryptedConfigs = new ConcurrentHashMap<>();
        this.encryptionKey = "default-encryption-key"; // In production, use proper key management
    }

    public void setSecureConfig(String key, String value) {
        String encrypted = encrypt(value);
        encryptedConfigs.put(key, encrypted);
    }

    public String getSecureConfig(String key) {
        String encrypted = encryptedConfigs.get(key);
        if (encrypted != null) {
            return decrypt(encrypted);
        }
        return null;
    }

    private String encrypt(String value) {
        // Simplified encryption for demonstration
        // In production, use proper encryption like AES-256
        return Base64.getEncoder().encodeToString(value.getBytes());
    }

    private String decrypt(String encrypted) {
        // Simplified decryption for demonstration
        return new String(Base64.getDecoder().decode(encrypted));
    }
}

/**
 * Validation function interface
 */
@FunctionalInterface
interface ConfigValidator {
    boolean validate(String value);
}

/**
 * Validating configuration store
 */
class ValidatingConfigStore extends ConfigurationStore {
    private final Map<String, ConfigValidator> validators;

    public ValidatingConfigStore() {
        super();
        this.validators = new ConcurrentHashMap<>();
    }

    public void addValidator(String key, ConfigValidator validator) {
        validators.put(key, validator);
    }

    @Override
    public void setConfig(String key, String value) {
        if (validate(key, value)) {
            super.setConfig(key, value);
        }
    }

    public boolean setConfig(String key, String value, boolean returnValidationResult) {
        boolean valid = validate(key, value);
        if (valid) {
            super.setConfig(key, value);
        }
        return valid;
    }

    public boolean setConfig(String key, String value) {
        return setConfig(key, value, true);
    }

    private boolean validate(String key, String value) {
        ConfigValidator validator = validators.get(key);
        if (validator != null) {
            return validator.validate(value);
        }
        return true; // No validator means valid
    }
}

/**
 * Multi-tenant configuration store
 */
class MultiTenantConfigStore {
    private final Map<String, Map<String, String>> tenantConfigs;

    public MultiTenantConfigStore() {
        this.tenantConfigs = new ConcurrentHashMap<>();
    }

    public void setTenantConfig(String tenantId, String key, String value) {
        tenantConfigs.computeIfAbsent(tenantId, k ->
            new ConcurrentHashMap<>()
        ).put(key, value);
    }

    public String getTenantConfig(String tenantId, String key) {
        Map<String, String> configs = tenantConfigs.get(tenantId);
        return configs != null ? configs.get(key) : null;
    }

    public String getTenantConfig(String tenantId, String key, String defaultValue) {
        Map<String, String> configs = tenantConfigs.get(tenantId);
        return configs != null ? configs.getOrDefault(key, defaultValue) : defaultValue;
    }

    public Map<String, String> getAllTenantConfigs(String tenantId) {
        Map<String, String> configs = tenantConfigs.get(tenantId);
        return configs != null ? new HashMap<>(configs) : new HashMap<>();
    }
}

/**
 * Configuration change listener
 */
@FunctionalInterface
interface ConfigChangeListener {
    void onConfigChange(String key, String oldValue, String newValue);
}

/**
 * Observable configuration store with change notifications
 */
class ObservableConfigStore extends ConfigurationStore {
    private final Map<String, List<ConfigChangeListener>> listeners;

    public ObservableConfigStore() {
        super();
        this.listeners = new ConcurrentHashMap<>();
    }

    public void addListener(String key, ConfigChangeListener listener) {
        listeners.computeIfAbsent(key, k ->
            new CopyOnWriteArrayList<>()
        ).add(listener);
    }

    @Override
    public void setConfig(String key, String value) {
        String oldValue = getConfig(key);
        super.setConfig(key, value);

        // Notify listeners
        List<ConfigChangeListener> keyListeners = listeners.get(key);
        if (keyListeners != null) {
            keyListeners.forEach(listener -> listener.onConfigChange(key, oldValue, value));
        }
    }
}

/**
 * Async configuration store
 */
class AsyncConfigStore {
    private final ConfigurationStore store;
    private final ExecutorService executor;

    public AsyncConfigStore() {
        this.store = new ConfigurationStore();
        this.executor = Executors.newFixedThreadPool(4);
    }

    public CompletableFuture<Void> loadConfigAsync(String key, String value) {
        return CompletableFuture.runAsync(() -> {
            try {
                // Simulate external fetch delay
                Thread.sleep(50);
                store.setConfig(key, value);
                System.out.println("  [Async] Loaded: " + key);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, executor);
    }

    public String getConfig(String key) {
        return store.getConfig(key);
    }

    public void shutdown() {
        executor.shutdown();
    }
}

/**
 * Cached configuration entry with TTL
 */
class CachedEntry {
    private final String value;
    private final Instant loadedAt;
    private final long ttlMs;

    public CachedEntry(String value, long ttlMs) {
        this.value = value;
        this.loadedAt = Instant.now();
        this.ttlMs = ttlMs;
    }

    public String getValue() { return value; }

    public boolean isExpired() {
        return Instant.now().isAfter(loadedAt.plusMillis(ttlMs));
    }
}

/**
 * Cached configuration store with TTL
 */
class CachedConfigStore extends ConfigurationStore {
    private final Map<String, CachedEntry> cache;
    private final long ttlMs;
    private final AtomicInteger cacheHits;
    private final AtomicInteger cacheMisses;

    public CachedConfigStore(long ttlMs) {
        super();
        this.cache = new ConcurrentHashMap<>();
        this.ttlMs = ttlMs;
        this.cacheHits = new AtomicInteger(0);
        this.cacheMisses = new AtomicInteger(0);
    }

    @Override
    public String getConfig(String key) {
        CachedEntry cached = cache.get(key);

        if (cached != null && !cached.isExpired()) {
            cacheHits.incrementAndGet();
            return cached.getValue();
        }

        cacheMisses.incrementAndGet();
        String value = super.getConfig(key);
        if (value != null) {
            cache.put(key, new CachedEntry(value, ttlMs));
        }
        return value;
    }

    @Override
    public void setConfig(String key, String value) {
        super.setConfig(key, value);
        cache.put(key, new CachedEntry(value, ttlMs));
    }

    public int getCacheHitCount() {
        return cacheHits.get();
    }

    public int getCacheMissCount() {
        return cacheMisses.get();
    }

    public void clearCache() {
        cache.clear();
    }
}
