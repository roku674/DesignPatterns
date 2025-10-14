package Enterprise.UnitOfWork;

/**
 * Base interface for all domain objects managed by UnitOfWork.
 *
 * @author Enterprise Patterns Implementation
 */
public interface DomainObject extends Cloneable {
    /**
     * Gets the unique identifier of the domain object.
     *
     * @return The object's ID
     */
    Long getId();

    /**
     * Creates a clone of this object.
     *
     * @return A cloned copy
     */
    DomainObject clone();
}
