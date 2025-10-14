package Enterprise.Concurrency;

/**
 * Customer address - part of customer aggregate
 */
public class CustomerAddress {
    private final Long id;
    private String street;
    private final Customer customer;

    public CustomerAddress(Long id, String street, Customer customer) {
        this.id = id;
        this.street = street;
        this.customer = customer;
    }

    public Long getId() {
        return id;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public Customer getCustomer() {
        return customer;
    }
}
