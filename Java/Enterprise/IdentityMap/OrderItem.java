package Enterprise.IdentityMap;
import java.math.BigDecimal;
public class OrderItem {
    private Long id;
    private Long productId;
    private int quantity;
    private BigDecimal price;
    public OrderItem(Long id, Long productId, int quantity, BigDecimal price) {
        this.id = id;
        this.productId = productId;
        this.quantity = quantity;
        this.price = price;
    }
    public Long getId() { return id; }
    public Long getProductId() { return productId; }
    public int getQuantity() { return quantity; }
    public BigDecimal getPrice() { return price; }
}
