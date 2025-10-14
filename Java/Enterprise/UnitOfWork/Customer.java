package Enterprise.UnitOfWork;

/**
 * Customer domain entity.
 *
 * @author Enterprise Patterns Implementation
 */
public class Customer implements DomainObject {
    private Long id;
    private String name;
    private String email;

    /**
     * Creates a new Customer.
     *
     * @param id The customer ID
     * @param name The customer name
     * @param email The customer email
     */
    public Customer(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    @Override
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public Customer clone() {
        return new Customer(this.id, this.name, this.email);
    }
}
