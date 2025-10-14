package Enterprise.IdentityMap;
import java.math.BigDecimal;
public class Product {
    private Long id;
    private String name;
    private BigDecimal price;
    private String category;
    public Product(Long id, String name, BigDecimal price, String category) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
    }
    public Long getId() { return id; }
    public String getName() { return name; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getCategory() { return category; }
}
