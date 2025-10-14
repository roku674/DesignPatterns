package Microservices.ExternalizedConfiguration;
import java.util.*;
public class ConfigServer {
    private Map<String, String> config = new HashMap<>();
    
    public void loadConfig(String filename) {
        config.put("db.url", "jdbc:mysql://localhost:3306/orders");
        config.put("db.pool.size", "10");
        config.put("cache.enabled", "true");
        config.put("api.timeout", "5000");
        System.out.println("Configuration loaded from: " + filename);
    }
    
    public String getConfig(String key) {
        return config.get(key);
    }
    
    public void updateConfig(String key, String value) {
        config.put(key, value);
        System.out.println("Configuration updated: " + key + " = " + value);
    }
    
    public Map<String, String> getAllConfig() {
        return new HashMap<>(config);
    }
}
