package Enterprise.Concurrency;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe repository using ConcurrentHashMap
 * Ensures all operations are thread-safe without explicit locking
 */
public class ThreadSafeRepository<T> {
    private final Map<Long, T> storage;

    public ThreadSafeRepository() {
        this.storage = new ConcurrentHashMap<>();
    }

    public void save(T entity) {
        if (entity == null) {
            throw new IllegalArgumentException("Entity cannot be null");
        }

        // Extract ID using reflection or interface
        Long id = extractId(entity);
        storage.put(id, entity);
    }

    public Optional<T> findById(Long id) {
        return Optional.ofNullable(storage.get(id));
    }

    public List<T> findAll() {
        return new ArrayList<>(storage.values());
    }

    public void delete(Long id) {
        storage.remove(id);
    }

    public long count() {
        return storage.size();
    }

    public boolean exists(Long id) {
        return storage.containsKey(id);
    }

    private Long extractId(T entity) {
        // Simplified ID extraction
        if (entity instanceof Product) {
            return ((Product) entity).getId();
        } else if (entity instanceof Account) {
            return ((Account) entity).getId();
        }
        throw new IllegalArgumentException("Cannot extract ID from entity: " + entity.getClass());
    }
}
