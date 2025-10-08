package Enterprise.DomainModel;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Domain Model pattern - incorporates both behavior and data.
 * Rich domain object with business logic.
 */
public class Customer {
    private Long id;
    private String name;
    private String email;
    private CustomerType type;
    private List<Order> orders;
    private BigDecimal creditLimit;

    public Customer(String name, String email, CustomerType type) {
        this.name = name;
        this.email = email;
        this.type = type;
        this.orders = new ArrayList<>();
        this.creditLimit = type.getDefaultCreditLimit();
    }

    /**
     * Business logic: Can customer place this order?
     */
    public boolean canPlaceOrder(BigDecimal orderAmount) {
        BigDecimal totalOutstanding = calculateOutstandingBalance();
        BigDecimal projectedBalance = totalOutstanding.add(orderAmount);
        return projectedBalance.compareTo(creditLimit) <= 0;
    }

    /**
     * Business logic: Place an order with validation.
     */
    public Order placeOrder(List<OrderLine> items) {
        BigDecimal orderTotal = items.stream()
                .map(OrderLine::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (!canPlaceOrder(orderTotal)) {
            throw new IllegalStateException("Order exceeds credit limit");
        }

        Order order = new Order(this, items);
        orders.add(order);
        return order;
    }

    /**
     * Business logic: Calculate outstanding balance.
     */
    public BigDecimal calculateOutstandingBalance() {
        return orders.stream()
                .filter(order -> !order.isPaid())
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Business logic: Get discount based on customer type.
     */
    public BigDecimal getDiscountPercentage() {
        return type.getDiscountPercentage();
    }

    /**
     * Business logic: Increase credit limit based on payment history.
     */
    public void increaseCreditLimit(BigDecimal amount) {
        if (hasGoodPaymentHistory()) {
            this.creditLimit = this.creditLimit.add(amount);
        } else {
            throw new IllegalStateException("Cannot increase credit limit - poor payment history");
        }
    }

    private boolean hasGoodPaymentHistory() {
        long paidOrders = orders.stream().filter(Order::isPaid).count();
        long totalOrders = orders.size();
        return totalOrders > 0 && (double) paidOrders / totalOrders >= 0.95;
    }

    // Getters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public CustomerType getType() { return type; }
    public List<Order> getOrders() { return new ArrayList<>(orders); }
    public BigDecimal getCreditLimit() { return creditLimit; }
}
