package Enterprise.Concurrency;

import java.util.HashMap;
import java.util.Map;

/**
 * Repository implementing optimistic locking strategy
 * Allows concurrent reads but detects conflicts on write
 */
public class OptimisticLockingRepository {
    private final Map<Long, Account> storage;

    public OptimisticLockingRepository() {
        this.storage = new HashMap<>();
    }

    public void save(Account account) {
        if (account.getId() == null) {
            throw new IllegalArgumentException("Account ID cannot be null");
        }

        Account existing = storage.get(account.getId());

        if (existing != null && existing.getVersion() != account.getVersion()) {
            throw new ConcurrentModificationException(
                "Account has been modified by another transaction. " +
                "Expected version: " + account.getVersion() +
                ", Actual version: " + existing.getVersion()
            );
        }

        account.incrementVersion();
        storage.put(account.getId(), account);
    }

    public Account findById(Long id) {
        Account account = storage.get(id);
        if (account == null) {
            throw new IllegalArgumentException("Account not found: " + id);
        }
        // Return a copy to simulate reading from database
        return new Account(account.getId(), account.getOwnerName(), account.getBalance()) {
            {
                for (int i = 0; i < account.getVersion(); i++) {
                    incrementVersion();
                }
            }
        };
    }
}
