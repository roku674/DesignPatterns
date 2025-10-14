package Enterprise.Base;

/**
 * Example domain entity extending Layer Supertype
 */
public class Customer extends DomainObject {
    private String name;
    private String email;

    public Customer(String name, String email) {
        super();
        this.name = name;
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        markModified();
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
        markModified();
    }

    @Override
    public String toString() {
        return "Customer{id=" + getId() + ", name='" + name + "', email='" + email + "'}";
    }
}
