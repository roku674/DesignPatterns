import java.util.*;

/**
 * Subsystem class - Cache Manager
 */
public class Memory {
    private Map<String, Object> cache = new HashMap<>();

    public void load(String key, Object data) {
        System.out.println("Cache: Storing key '" + key + "' in cache");
        cache.put(key, data);
    }

    public Object get(String key) {
        Object data = cache.get(key);
        if (data != null) {
            System.out.println("Cache: Cache HIT for key '" + key + "'");
        } else {
            System.out.println("Cache: Cache MISS for key '" + key + "'");
        }
        return data;
    }

    public void clear() {
        System.out.println("Cache: Clearing all cached data");
        cache.clear();
    }

    public int size() {
        return cache.size();
    }
}
