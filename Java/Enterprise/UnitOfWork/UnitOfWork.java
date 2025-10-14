package Enterprise.UnitOfWork;

import java.util.*;

/**
 * UnitOfWork - Tracks changes to domain objects during a business transaction.
 *
 * This class maintains lists of new, modified, and deleted objects and
 * coordinates the writing out of changes to the database. It ensures all
 * changes are committed atomically.
 *
 * @author Enterprise Patterns Implementation
 */
public class UnitOfWork {
    private List<DomainObject> newObjects;
    private List<DomainObject> dirtyObjects;
    private List<DomainObject> removedObjects;
    private UnitOfWork parent;
    private IsolationLevel isolationLevel;
    private boolean committed;

    /**
     * Creates a new UnitOfWork with default isolation level.
     */
    public UnitOfWork() {
        this(IsolationLevel.READ_COMMITTED);
    }

    /**
     * Creates a new UnitOfWork with specified isolation level.
     *
     * @param isolationLevel The transaction isolation level
     */
    public UnitOfWork(IsolationLevel isolationLevel) {
        this.newObjects = new ArrayList<>();
        this.dirtyObjects = new ArrayList<>();
        this.removedObjects = new ArrayList<>();
        this.isolationLevel = isolationLevel;
        this.committed = false;
    }

    /**
     * Creates a nested UnitOfWork.
     *
     * @param parent The parent UnitOfWork
     */
    public UnitOfWork(UnitOfWork parent) {
        this();
        this.parent = parent;
    }

    /**
     * Registers a new object to be inserted.
     *
     * @param obj The object to insert
     */
    public void registerNew(DomainObject obj) {
        if (committed) {
            throw new IllegalStateException("Cannot register new object after commit");
        }
        if (!newObjects.contains(obj) && !dirtyObjects.contains(obj) && !removedObjects.contains(obj)) {
            newObjects.add(obj);
        }
    }

    /**
     * Registers an object as modified.
     *
     * @param obj The object that was modified
     */
    public void registerDirty(DomainObject obj) {
        if (committed) {
            throw new IllegalStateException("Cannot register dirty object after commit");
        }
        if (!dirtyObjects.contains(obj) && !newObjects.contains(obj)) {
            dirtyObjects.add(obj);
        }
    }

    /**
     * Registers an object for deletion.
     *
     * @param obj The object to delete
     */
    public void registerRemoved(DomainObject obj) {
        if (committed) {
            throw new IllegalStateException("Cannot register removed object after commit");
        }
        if (newObjects.remove(obj)) {
            return; // Was new, no need to delete from DB
        }
        dirtyObjects.remove(obj);
        if (!removedObjects.contains(obj)) {
            removedObjects.add(obj);
        }
    }

    /**
     * Commits all changes to the database.
     *
     * @throws ConcurrentModificationException if optimistic locking fails
     */
    public void commit() throws ConcurrentModificationException {
        if (committed) {
            throw new IllegalStateException("Transaction already committed");
        }

        System.out.println("  [UoW] Starting commit with isolation level: " + isolationLevel);

        // Check for version conflicts (optimistic locking)
        for (DomainObject obj : dirtyObjects) {
            if (obj instanceof Versionable) {
                Versionable versionable = (Versionable) obj;
                if (versionable.hasVersionConflict()) {
                    throw new ConcurrentModificationException(
                        "Version conflict detected for " + obj.getClass().getSimpleName()
                    );
                }
            }
        }

        // Insert new objects
        for (DomainObject obj : newObjects) {
            System.out.println("  [UoW] INSERT: " + obj.getClass().getSimpleName() + " #" + obj.getId());
        }

        // Update modified objects
        for (DomainObject obj : dirtyObjects) {
            System.out.println("  [UoW] UPDATE: " + obj.getClass().getSimpleName() + " #" + obj.getId());
            if (obj instanceof Versionable) {
                ((Versionable) obj).incrementVersion();
            }
        }

        // Delete removed objects
        for (DomainObject obj : removedObjects) {
            System.out.println("  [UoW] DELETE: " + obj.getClass().getSimpleName() + " #" + obj.getId());
        }

        committed = true;
        System.out.println("  [UoW] Commit completed successfully");

        // If nested, merge changes to parent
        if (parent != null) {
            mergeToParent();
        }

        clear();
    }

    /**
     * Rolls back all changes.
     */
    public void rollback() {
        System.out.println("  [UoW] Rolling back transaction");
        clear();
        committed = false;
    }

    /**
     * Merges changes to parent UnitOfWork.
     */
    private void mergeToParent() {
        if (parent != null) {
            newObjects.forEach(parent::registerNew);
            dirtyObjects.forEach(parent::registerDirty);
            removedObjects.forEach(parent::registerRemoved);
        }
    }

    /**
     * Clears all tracked changes.
     */
    private void clear() {
        newObjects.clear();
        dirtyObjects.clear();
        removedObjects.clear();
    }

    /**
     * Gets list of new entities.
     *
     * @return List of new entities
     */
    public List<DomainObject> getNewEntities() {
        return new ArrayList<>(newObjects);
    }

    /**
     * Gets list of modified entities.
     *
     * @return List of modified entities
     */
    public List<DomainObject> getDirtyEntities() {
        return new ArrayList<>(dirtyObjects);
    }

    /**
     * Gets list of removed entities.
     *
     * @return List of removed entities
     */
    public List<DomainObject> getRemovedEntities() {
        return new ArrayList<>(removedObjects);
    }

    /**
     * Checks if the unit of work is committed.
     *
     * @return true if committed
     */
    public boolean isCommitted() {
        return committed;
    }

    /**
     * Gets the isolation level.
     *
     * @return The isolation level
     */
    public IsolationLevel getIsolationLevel() {
        return isolationLevel;
    }
}
