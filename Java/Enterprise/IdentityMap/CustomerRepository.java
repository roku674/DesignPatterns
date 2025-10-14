package Enterprise.IdentityMap;
public class CustomerRepository {
    private IdentityMap<Long, Customer> identityMap;
    public CustomerRepository(IdentityMap<Long, Customer> identityMap) {
        this.identityMap = identityMap;
    }
    public Customer findById(Long id) {
        Customer customer = identityMap.get(id);
        if (customer == null) {
            System.out.println("    [DB] Loading customer #" + id);
            customer = loadFromDatabase(id);
            identityMap.put(id, customer);
        }
        return customer;
    }
    private Customer loadFromDatabase(Long id) {
        return new Customer(id, "Customer " + id, "customer" + id + "@example.com");
    }
}
