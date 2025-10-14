package Enterprise.UnitOfWork;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Order domain entity.
 *
 * @author Enterprise Patterns Implementation
 */
public class Order implements DomainObject {
    private Long id;
    private Long customerId;
    private LocalDateTime orderDate;
    private BigDecimal total;
    private String status;
    private Long shippingAddressId;
    private Long paymentMethodId;

    public Order(Long id, Long customerId, LocalDateTime orderDate) {
        this.id = id;
        this.customerId = customerId;
        this.orderDate = orderDate;
        this.status = "PENDING";
        this.total = BigDecimal.ZERO;
    }

    @Override
    public Long getId() {
        return id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getShippingAddressId() {
        return shippingAddressId;
    }

    public void setShippingAddressId(Long shippingAddressId) {
        this.shippingAddressId = shippingAddressId;
    }

    public Long getPaymentMethodId() {
        return paymentMethodId;
    }

    public void setPaymentMethodId(Long paymentMethodId) {
        this.paymentMethodId = paymentMethodId;
    }

    @Override
    public Order clone() {
        Order clone = new Order(this.id, this.customerId, this.orderDate);
        clone.total = this.total;
        clone.status = this.status;
        clone.shippingAddressId = this.shippingAddressId;
        clone.paymentMethodId = this.paymentMethodId;
        return clone;
    }
}
