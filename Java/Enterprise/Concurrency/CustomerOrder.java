package Enterprise.Concurrency;

/**
 * Customer order - part of customer aggregate
 */
public class CustomerOrder {
    private final Long id;
    private double amount;
    private final Customer customer;

    public CustomerOrder(Long id, double amount, Customer customer) {
        this.id = id;
        this.amount = amount;
        this.customer = customer;
    }

    public Long getId() {
        return id;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public Customer getCustomer() {
        return customer;
    }
}
