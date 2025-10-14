package Enterprise.IdentityMap;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Generic IdentityMap implementation with LRU eviction and statistics tracking.
 */
public class IdentityMap<K, V> {
    private Map<K, V> map;
    private int maxSize;
    private long hits = 0;
    private long misses = 0;
    private boolean threadSafe;

    public IdentityMap() {
        this(Integer.MAX_VALUE, false);
    }

    public IdentityMap(boolean threadSafe) {
        this(Integer.MAX_VALUE, threadSafe);
    }

    public IdentityMap(int maxSize) {
        this(maxSize, false);
    }

    public IdentityMap(int maxSize, boolean threadSafe) {
        this.maxSize = maxSize;
        this.threadSafe = threadSafe;
        if (threadSafe) {
            this.map = new ConcurrentHashMap<>();
        } else {
            this.map = new LinkedHashMap<K, V>(maxSize, 0.75f, true) {
                @Override
                protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
                    return size() > IdentityMap.this.maxSize;
                }
            };
        }
    }

    public V get(K key) {
        V value = map.get(key);
        if (value != null) {
            hits++;
        } else {
            misses++;
        }
        return value;
    }

    public void put(K key, V value) {
        if (threadSafe && map.size() >= maxSize && !map.containsKey(key)) {
            K firstKey = map.keySet().iterator().next();
            map.remove(firstKey);
        }
        map.put(key, value);
    }

    public boolean contains(K key) {
        return map.containsKey(key);
    }

    public void remove(K key) {
        map.remove(key);
    }

    public void clear() {
        map.clear();
        hits = 0;
        misses = 0;
    }

    public int size() {
        return map.size();
    }

    public double getHitRate() {
        long total = hits + misses;
        return total == 0 ? 0 : (double) hits / total;
    }

    public void printStatistics() {
        System.out.println("  Hits: " + hits);
        System.out.println("  Misses: " + misses);
        System.out.println("  Size: " + size());
    }
}
