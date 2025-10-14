package Enterprise.Base;

import java.util.HashMap;
import java.util.Map;

/**
 * Example configuration service
 */
public class ConfigurationService {
    private final Map<String, String> config;

    public ConfigurationService() {
        this.config = new HashMap<>();
        // Load default configuration
        config.put("app.name", "Enterprise Application");
        config.put("app.version", "1.0.0");
        config.put("max.connections", "100");
    }

    public String get(String key) {
        return config.getOrDefault(key, "");
    }

    public void set(String key, String value) {
        config.put(key, value);
    }
}
