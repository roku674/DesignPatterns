package Microservices.CQRS;
import java.util.*;
public class QueryService {
    private Map<String, ProductView> readModel = new HashMap<>();
    
    public QueryService() {
        readModel.put("prod-1", new ProductView("prod-1", "Laptop", 899.99, 4.5));
    }
    
    public void getProduct(String id) {
        ProductView product = readModel.get(id);
        if (product != null) {
            System.out.println("Query: " + product);
        }
    }
    
    public void searchProducts(String keyword) {
        System.out.println("Query: Searching for '" + keyword + "'");
        readModel.values().stream()
            .filter(p -> p.name.contains(keyword))
            .forEach(p -> System.out.println("  Found: " + p));
    }
}
class ProductView {
    String id, name;
    double price, rating;
    ProductView(String id, String name, double price, double rating) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.rating = rating;
    }
    public String toString() {
        return String.format("%s: %s - $%.2f (%.1f stars)", id, name, price, rating);
    }
}
