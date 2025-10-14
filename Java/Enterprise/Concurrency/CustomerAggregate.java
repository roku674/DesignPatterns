package Enterprise.Concurrency;

/**
 * Coarse-Grained Lock Pattern
 * Locks all related objects in an aggregate together
 */
public class CustomerAggregate {
    private final Customer customer;
    private final CustomerAddress address;
    private final CustomerOrder order;
    private boolean locked;

    public CustomerAggregate(Customer customer, CustomerAddress address, CustomerOrder order) {
        this.customer = customer;
        this.address = address;
        this.order = order;
        this.locked = false;
    }

    public synchronized void lock() {
        if (locked) {
            throw new IllegalStateException("Aggregate is already locked");
        }
        locked = true;
        System.out.println("  Locked customer ID: " + customer.getId());
        System.out.println("  Locked address ID: " + address.getId());
        System.out.println("  Locked order ID: " + order.getId());
    }

    public synchronized void unlock() {
        if (!locked) {
            throw new IllegalStateException("Aggregate is not locked");
        }
        locked = false;
        System.out.println("  Unlocked customer ID: " + customer.getId());
        System.out.println("  Unlocked address ID: " + address.getId());
        System.out.println("  Unlocked order ID: " + order.getId());
    }

    public Customer getCustomer() {
        assertLocked();
        return customer;
    }

    public CustomerAddress getAddress() {
        assertLocked();
        return address;
    }

    public CustomerOrder getOrder() {
        assertLocked();
        return order;
    }

    private void assertLocked() {
        if (!locked) {
            throw new IllegalStateException("Aggregate must be locked before access");
        }
    }
}
