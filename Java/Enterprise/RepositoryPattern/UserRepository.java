package Enterprise.RepositoryPattern;

import java.util.List;
import java.util.Optional;

/**
 * Repository Pattern - Interface for User data access.
 * Mediates between domain and data mapping layers using collection-like interface.
 */
public interface UserRepository {
    /**
     * Finds user by ID.
     */
    Optional<User> findById(Long id);

    /**
     * Finds user by username.
     */
    Optional<User> findByUsername(String username);

    /**
     * Finds all users.
     */
    List<User> findAll();

    /**
     * Finds active users.
     */
    List<User> findActiveUsers();

    /**
     * Saves a user (insert or update).
     */
    void save(User user);

    /**
     * Deletes a user.
     */
    void delete(User user);

    /**
     * Counts total users.
     */
    long count();
}
