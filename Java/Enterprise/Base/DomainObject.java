package Enterprise.Base;

import java.util.Date;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Layer Supertype Pattern
 * Base class for all domain objects, providing common identity and audit fields.
 */
public abstract class DomainObject {
    private static final AtomicLong idGenerator = new AtomicLong(1);

    private final Long id;
    private final Date createdAt;
    private Date modifiedAt;

    protected DomainObject() {
        this.id = idGenerator.getAndIncrement();
        this.createdAt = new Date();
        this.modifiedAt = new Date();
    }

    public Long getId() {
        return id;
    }

    public Date getCreatedAt() {
        return new Date(createdAt.getTime());
    }

    public Date getModifiedAt() {
        return new Date(modifiedAt.getTime());
    }

    protected void markModified() {
        this.modifiedAt = new Date();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DomainObject that = (DomainObject) o;
        return id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }
}
