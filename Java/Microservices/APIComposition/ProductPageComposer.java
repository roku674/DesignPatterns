package Microservices.APIComposition;

import java.util.List;

/**
 * Product Page Composer - Aggregates product, reviews, and inventory data
 */
public class ProductPageComposer {
    private final ProductService productService;
    private final ReviewService reviewService;
    private final InventoryService inventoryService;

    public ProductPageComposer(ProductService productService,
                              ReviewService reviewService,
                              InventoryService inventoryService) {
        this.productService = productService;
        this.reviewService = reviewService;
        this.inventoryService = inventoryService;
    }

    /**
     * Composes a complete product page by aggregating data from multiple services
     *
     * @param productId The product identifier
     * @return Composed product page response
     */
    public ProductPageResponse composeProductPage(String productId) {
        System.out.println("Composing product page for: " + productId);

        // Sequential composition - call each service one by one
        Product product = productService.getProduct(productId);
        List<Review> reviews = reviewService.getReviews(productId);
        double avgRating = reviewService.getAverageRating(productId);
        Inventory inventory = inventoryService.getInventory(productId);

        return new ProductPageResponse(product, reviews, avgRating, inventory);
    }
}

/**
 * Product Page Response - Aggregated response containing all product page data
 */
class ProductPageResponse {
    private final Product product;
    private final List<Review> reviews;
    private final double averageRating;
    private final Inventory inventory;

    public ProductPageResponse(Product product, List<Review> reviews,
                              double averageRating, Inventory inventory) {
        this.product = product;
        this.reviews = reviews;
        this.averageRating = averageRating;
        this.inventory = inventory;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("Product Page Response:\n");
        sb.append("  ").append(product).append("\n");
        sb.append("  Average Rating: ").append(String.format("%.1f", averageRating)).append("/5\n");
        sb.append("  ").append(inventory).append("\n");
        sb.append("  Reviews (").append(reviews.size()).append("):\n");
        reviews.forEach(r -> sb.append("    - ").append(r).append("\n"));
        return sb.toString();
    }
}
