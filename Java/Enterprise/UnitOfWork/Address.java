package Enterprise.UnitOfWork;

/**
 * Address domain entity.
 */
public class Address implements DomainObject {
    private Long id;
    private Long customerId;
    private String street;
    private String city;
    private String state;
    private String zipCode;

    public Address(Long id, Long customerId, String street, String city, String state, String zipCode) {
        this.id = id;
        this.customerId = customerId;
        this.street = street;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
    }

    @Override
    public Long getId() {
        return id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getStreet() {
        return street;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getZipCode() {
        return zipCode;
    }

    @Override
    public Address clone() {
        return new Address(this.id, this.customerId, this.street, this.city, this.state, this.zipCode);
    }
}
