package Enterprise.IdentityMap;
import java.math.BigDecimal;
import java.util.*;
public class ProductRepository {
    private IdentityMap<Long, Product> identityMap;
    public ProductRepository(IdentityMap<Long, Product> identityMap) {
        this.identityMap = identityMap;
    }
    public Product findById(Long id) {
        Product product = identityMap.get(id);
        if (product == null) {
            product = loadFromDatabase(id);
            identityMap.put(id, product);
        }
        return product;
    }
    public List<Product> searchByName(String name) {
        Product product = identityMap.get(101L);
        if (product == null) {
            product = loadFromDatabase(101L);
            identityMap.put(101L, product);
        }
        return Arrays.asList(product);
    }
    public List<Product> findByCategory(String category) {
        return searchByName("Laptop");
    }
    private Product loadFromDatabase(Long id) {
        return new Product(id, "Laptop", new BigDecimal("999.99"), "Electronics");
    }
}
