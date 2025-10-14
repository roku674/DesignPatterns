package Microservices.APIComposition;
public class CustomerService {
    public Customer getCustomer(String customerId) {
        simulateDelay(90);
        return new Customer(customerId, "Bob Smith", "bob@example.com", "555-0123");
    }
    private void simulateDelay(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}
class Customer {
    private String id, name, email, phone;
    public Customer(String id, String name, String email, String phone) {
        this.id = id; this.name = name; this.email = email; this.phone = phone;
    }
    public String toString() { return String.format("Customer{name='%s', email='%s'}", name, email); }
}
