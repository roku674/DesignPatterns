package Enterprise.RepositoryPattern;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * In-memory implementation of UserRepository.
 * Demonstrates the Repository pattern without database dependencies.
 */
public class InMemoryUserRepository implements UserRepository {
    private final Map<Long, User> storage;
    private final AtomicLong idGenerator;

    public InMemoryUserRepository() {
        this.storage = new ConcurrentHashMap<>();
        this.idGenerator = new AtomicLong(1);
    }

    @Override
    public Optional<User> findById(Long id) {
        return Optional.ofNullable(storage.get(id));
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return storage.values().stream()
                .filter(user -> user.getUsername().equals(username))
                .findFirst();
    }

    @Override
    public List<User> findAll() {
        return new ArrayList<>(storage.values());
    }

    @Override
    public List<User> findActiveUsers() {
        return storage.values().stream()
                .filter(User::isActive)
                .collect(Collectors.toList());
    }

    @Override
    public void save(User user) {
        if (user.getId() == null) {
            // New user - assign ID
            user.setId(idGenerator.getAndIncrement());
        }
        storage.put(user.getId(), user);
    }

    @Override
    public void delete(User user) {
        if (user.getId() != null) {
            storage.remove(user.getId());
        }
    }

    @Override
    public long count() {
        return storage.size();
    }
}
