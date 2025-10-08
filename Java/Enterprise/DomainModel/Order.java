package Enterprise.DomainModel;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Domain Model for Order - contains both data and business logic.
 */
public class Order {
    private Long id;
    private Customer customer;
    private List<OrderLine> lines;
    private LocalDateTime orderDate;
    private OrderStatus status;
    private BigDecimal paidAmount;

    public Order(Customer customer, List<OrderLine> lines) {
        if (customer == null || lines == null || lines.isEmpty()) {
            throw new IllegalArgumentException("Invalid order parameters");
        }

        this.customer = customer;
        this.lines = new ArrayList<>(lines);
        this.orderDate = LocalDateTime.now();
        this.status = OrderStatus.PENDING;
        this.paidAmount = BigDecimal.ZERO;
    }

    /**
     * Business logic: Calculate total with customer discount applied.
     */
    public BigDecimal getTotal() {
        BigDecimal subtotal = lines.stream()
                .map(OrderLine::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discount = customer.getDiscountPercentage();
        BigDecimal discountAmount = subtotal.multiply(discount)
                .setScale(2, RoundingMode.HALF_UP);

        return subtotal.subtract(discountAmount);
    }

    /**
     * Business logic: Process payment for this order.
     */
    public void processPayment(BigDecimal amount) {
        if (status != OrderStatus.PENDING) {
            throw new IllegalStateException("Can only pay for pending orders");
        }

        if (amount.compareTo(getTotal()) < 0) {
            throw new IllegalArgumentException("Payment amount insufficient");
        }

        this.paidAmount = amount;
        this.status = OrderStatus.PAID;
    }

    /**
     * Business logic: Can this order be cancelled?
     */
    public boolean canBeCancelled() {
        return status == OrderStatus.PENDING;
    }

    /**
     * Business logic: Cancel the order.
     */
    public void cancel() {
        if (!canBeCancelled()) {
            throw new IllegalStateException("Order cannot be cancelled in current status: " + status);
        }
        this.status = OrderStatus.CANCELLED;
    }

    /**
     * Business logic: Is order paid?
     */
    public boolean isPaid() {
        return status == OrderStatus.PAID;
    }

    // Getters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Customer getCustomer() { return customer; }
    public List<OrderLine> getLines() { return Collections.unmodifiableList(lines); }
    public LocalDateTime getOrderDate() { return orderDate; }
    public OrderStatus getStatus() { return status; }

    @Override
    public String toString() {
        return String.format("Order{id=%d, customer=%s, total=%.2f, status=%s}",
                id, customer.getName(), getTotal(), status);
    }
}
