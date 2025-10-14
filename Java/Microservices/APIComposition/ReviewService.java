package Microservices.APIComposition;

import java.util.ArrayList;
import java.util.List;

/**
 * Review Service - Simulates a microservice that provides product reviews
 */
public class ReviewService {

    /**
     * Retrieves reviews for a product
     *
     * @param productId The product identifier
     * @return List of reviews
     */
    public List<Review> getReviews(String productId) {
        simulateNetworkDelay(150);

        if (productId.equals("PROD-ERROR")) {
            throw new RuntimeException("Review service unavailable");
        }

        List<Review> reviews = new ArrayList<>();
        reviews.add(new Review("REV-1", productId, "John Doe", 5, "Excellent product!"));
        reviews.add(new Review("REV-2", productId, "Jane Smith", 4, "Good quality, fast delivery"));
        reviews.add(new Review("REV-3", productId, "Bob Johnson", 5, "Worth every penny"));
        return reviews;
    }

    /**
     * Gets average rating for a product
     *
     * @param productId The product identifier
     * @return Average rating
     */
    public double getAverageRating(String productId) {
        List<Review> reviews = getReviews(productId);
        return reviews.stream()
            .mapToInt(Review::getRating)
            .average()
            .orElse(0.0);
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
 * Review domain object
 */
class Review {
    private String id;
    private String productId;
    private String author;
    private int rating;
    private String comment;

    public Review(String id, String productId, String author, int rating, String comment) {
        this.id = id;
        this.productId = productId;
        this.author = author;
        this.rating = rating;
        this.comment = comment;
    }

    public String getId() { return id; }
    public String getProductId() { return productId; }
    public String getAuthor() { return author; }
    public int getRating() { return rating; }
    public String getComment() { return comment; }

    @Override
    public String toString() {
        return String.format("Review{author='%s', rating=%d, comment='%s'}",
            author, rating, comment);
    }
}
