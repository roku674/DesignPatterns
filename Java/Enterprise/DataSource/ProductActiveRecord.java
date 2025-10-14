package Enterprise.DataSource;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Active Record Pattern
 * Domain object that contains both data and database access methods
 */
public class ProductActiveRecord {
    private static final AtomicLong idGenerator = new AtomicLong(1);
    private static final Map<Long, ProductActiveRecord> storage = new HashMap<>();

    private Long id;
    private String name;
    private double price;
    private int stock;

    public ProductActiveRecord(String name, double price, int stock) {
        this.name = name;
        this.price = price;
        this.stock = stock;
    }

    private ProductActiveRecord(Long id, String name, double price, int stock) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.stock = stock;
    }

    // Persistence methods
    public void save() {
        if (id == null) {
            this.id = idGenerator.getAndIncrement();
        }
        storage.put(this.id, this);
    }

    public void delete() {
        if (id != null) {
            storage.remove(id);
        }
    }

    public static Optional<ProductActiveRecord> find(Long id) {
        return Optional.ofNullable(storage.get(id));
    }

    public static List<ProductActiveRecord> findAll() {
        return new ArrayList<>(storage.values());
    }

    public static List<ProductActiveRecord> findByPriceRange(double min, double max) {
        List<ProductActiveRecord> result = new ArrayList<>();
        for (ProductActiveRecord product : storage.values()) {
            if (product.getPrice() >= min && product.getPrice() <= max) {
                result.add(product);
            }
        }
        return result;
    }

    // Business logic methods
    public void sell(int quantity) {
        if (quantity > stock) {
            throw new IllegalStateException("Insufficient stock");
        }
        this.stock -= quantity;
        save();
    }

    public void restock(int quantity) {
        this.stock += quantity;
        save();
    }

    public boolean isLowStock() {
        return stock < 10;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    @Override
    public String toString() {
        return "Product{id=" + id + ", name='" + name + "', price=" + price + ", stock=" + stock + "}";
    }
}
