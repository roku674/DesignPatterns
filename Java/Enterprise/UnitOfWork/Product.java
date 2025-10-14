package Enterprise.UnitOfWork;

import java.math.BigDecimal;

/**
 * Product domain entity with version support for optimistic locking.
 *
 * @author Enterprise Patterns Implementation
 */
public class Product implements DomainObject, Versionable {
    private Long id;
    private String name;
    private BigDecimal price;
    private int stockQuantity;
    private int version;
    private int originalVersion;

    public Product(Long id, String name, BigDecimal price, int stockQuantity) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.version = 0;
        this.originalVersion = 0;
    }

    @Override
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public int getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(int stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    @Override
    public int getVersion() {
        return version;
    }

    @Override
    public void setVersion(int version) {
        this.originalVersion = this.version;
        this.version = version;
    }

    @Override
    public void incrementVersion() {
        this.version++;
    }

    @Override
    public boolean hasVersionConflict() {
        // In real implementation, would check against database version
        return false;
    }

    @Override
    public Product clone() {
        Product clone = new Product(this.id, this.name, this.price, this.stockQuantity);
        clone.version = this.version;
        clone.originalVersion = this.version;
        return clone;
    }
}
