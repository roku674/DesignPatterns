package Enterprise.UnitOfWork;

/**
 * Interface for objects that support optimistic locking through versioning.
 *
 * @author Enterprise Patterns Implementation
 */
public interface Versionable {
    /**
     * Gets the current version number.
     *
     * @return The version number
     */
    int getVersion();

    /**
     * Sets the version number.
     *
     * @param version The new version number
     */
    void setVersion(int version);

    /**
     * Increments the version number.
     */
    void incrementVersion();

    /**
     * Checks if there is a version conflict.
     *
     * @return true if version conflict detected
     */
    boolean hasVersionConflict();
}
