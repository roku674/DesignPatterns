package Enterprise.DomainModel;

import java.math.BigDecimal;

/**
 * Simple product entity.
 */
public class Product {
    private Long id;
    private String name;
    private BigDecimal price;
    private int stockQuantity;

    public Product(String name, BigDecimal price, int stockQuantity) {
        this.name = name;
        this.price = price;
        this.stockQuantity = stockQuantity;
    }

    /**
     * Business logic: Check if product is in stock.
     */
    public boolean isInStock(int quantity) {
        return stockQuantity >= quantity;
    }

    /**
     * Business logic: Reserve stock for an order.
     */
    public void reserveStock(int quantity) {
        if (!isInStock(quantity)) {
            throw new IllegalStateException("Insufficient stock for " + name);
        }
        stockQuantity -= quantity;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public BigDecimal getPrice() { return price; }
    public int getStockQuantity() { return stockQuantity; }
}
