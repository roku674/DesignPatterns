package Microservices.APIComposition;

/**
 * Product Service - Simulates a microservice that provides product information
 */
public class ProductService {

    /**
     * Retrieves product information by ID
     *
     * @param productId The product identifier
     * @return Product information
     */
    public Product getProduct(String productId) {
        simulateNetworkDelay(100);

        if (productId.equals("PROD-ERROR")) {
            throw new RuntimeException("Product service unavailable");
        }

        return new Product(
            productId,
            "Wireless Headphones",
            "High-quality wireless headphones with noise cancellation",
            199.99,
            "Electronics"
        );
    }

    private void simulateNetworkDelay(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

/**
 * Product domain object
 */
class Product {
    private String id;
    private String name;
    private String description;
    private double price;
    private String category;

    public Product(String id, String name, String description, double price, String category) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public double getPrice() { return price; }
    public String getCategory() { return category; }

    @Override
    public String toString() {
        return String.format("Product{id='%s', name='%s', price=$%.2f, category='%s'}",
            id, name, price, category);
    }
}
