package Microservices.APIComposition;
import java.util.*;
import java.util.concurrent.*;
public class ParallelComposer {
    private final ProductService productService;
    private final ReviewService reviewService;
    private final InventoryService inventoryService;
    private final ExecutorService executor = Executors.newFixedThreadPool(3);
    public ParallelComposer(ProductService productService, ReviewService reviewService, InventoryService inventoryService) {
        this.productService = productService; this.reviewService = reviewService; this.inventoryService = inventoryService;
    }
    public ProductPageResponse composeInParallel(String productId) {
        System.out.println("Composing product page in parallel for: " + productId);
        try {
            Future<Product> productFuture = executor.submit(() -> productService.getProduct(productId));
            Future<List<Review>> reviewsFuture = executor.submit(() -> reviewService.getReviews(productId));
            Future<Inventory> inventoryFuture = executor.submit(() -> inventoryService.getInventory(productId));
            Product product = productFuture.get();
            List<Review> reviews = reviewsFuture.get();
            Inventory inventory = inventoryFuture.get();
            double avgRating = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
            return new ProductPageResponse(product, reviews, avgRating, inventory);
        } catch (Exception e) {
            throw new RuntimeException("Parallel composition failed", e);
        }
    }
}
