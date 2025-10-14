package Enterprise.Concurrency;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Repository implementing pessimistic locking strategy
 * Locks resources before reading to prevent conflicts
 */
public class PessimisticLockingRepository {
    private final Map<Long, Account> storage;
    private final Set<Long> lockedIds;

    public PessimisticLockingRepository() {
        this.storage = new HashMap<>();
        this.lockedIds = new HashSet<>();
    }

    public synchronized void save(Account account) {
        if (account.getId() == null) {
            throw new IllegalArgumentException("Account ID cannot be null");
        }
        storage.put(account.getId(), account);
    }

    public synchronized Account findByIdForUpdate(Long id) {
        if (lockedIds.contains(id)) {
            throw new IllegalStateException("Account is already locked: " + id);
        }

        Account account = storage.get(id);
        if (account == null) {
            throw new IllegalArgumentException("Account not found: " + id);
        }

        lockedIds.add(id);
        return account;
    }

    public synchronized void releaseLock(Long id) {
        lockedIds.remove(id);
    }

    public synchronized boolean isLocked(Long id) {
        return lockedIds.contains(id);
    }
}
