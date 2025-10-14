package Microservices.APIComposition;
import java.util.*;
public class ResilientComposer {
    private final ProductService productService;
    private final ReviewService reviewService;
    private final InventoryService inventoryService;
    public ResilientComposer(ProductService productService, ReviewService reviewService, InventoryService inventoryService) {
        this.productService = productService; this.reviewService = reviewService; this.inventoryService = inventoryService;
    }
    public ProductPageResponse composeWithFallback(String productId) {
        System.out.println("Composing with fallback for: " + productId);
        Product product = safeGetProduct(productId);
        List<Review> reviews = safeGetReviews(productId);
        Inventory inventory = safeGetInventory(productId);
        double avgRating = reviews.isEmpty() ? 0.0 : reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        return new ProductPageResponse(product, reviews, avgRating, inventory);
    }
    private Product safeGetProduct(String productId) {
        try {
            return productService.getProduct(productId);
        } catch (Exception e) {
            System.out.println("Product service failed, using fallback: " + e.getMessage());
            return new Product(productId, "Product Unavailable", "Product details temporarily unavailable", 0.0, "Unknown");
        }
    }
    private List<Review> safeGetReviews(String productId) {
        try {
            return reviewService.getReviews(productId);
        } catch (Exception e) {
            System.out.println("Review service failed, using fallback: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    private Inventory safeGetInventory(String productId) {
        try {
            return inventoryService.getInventory(productId);
        } catch (Exception e) {
            System.out.println("Inventory service failed, using fallback: " + e.getMessage());
            return new Inventory(productId, 0, "Unknown", false);
        }
    }
}
