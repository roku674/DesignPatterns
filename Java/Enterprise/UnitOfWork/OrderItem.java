package Enterprise.UnitOfWork;

import java.math.BigDecimal;

/**
 * OrderItem domain entity.
 */
public class OrderItem implements DomainObject {
    private Long id;
    private Long orderId;
    private Long productId;
    private int quantity;
    private BigDecimal price;

    public OrderItem(Long id, Long orderId, Long productId, int quantity, BigDecimal price) {
        this.id = id;
        this.orderId = orderId;
        this.productId = productId;
        this.quantity = quantity;
        this.price = price;
    }

    @Override
    public Long getId() {
        return id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public Long getProductId() {
        return productId;
    }

    public int getQuantity() {
        return quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    @Override
    public OrderItem clone() {
        return new OrderItem(this.id, this.orderId, this.productId, this.quantity, this.price);
    }
}
