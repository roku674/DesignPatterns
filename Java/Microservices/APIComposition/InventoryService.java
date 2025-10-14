package Microservices.APIComposition;

/**
 * Inventory Service - Simulates a microservice that provides inventory information
 */
public class InventoryService {

    /**
     * Retrieves inventory information for a product
     *
     * @param productId The product identifier
     * @return Inventory information
     */
    public Inventory getInventory(String productId) {
        simulateNetworkDelay(80);

        if (productId.equals("PROD-ERROR")) {
            throw new RuntimeException("Inventory service unavailable");
        }

        return new Inventory(
            productId,
            45,
            "Warehouse A",
            true
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
 * Inventory domain object
 */
class Inventory {
    private String productId;
    private int quantity;
    private String location;
    private boolean available;

    public Inventory(String productId, int quantity, String location, boolean available) {
        this.productId = productId;
        this.quantity = quantity;
        this.location = location;
        this.available = available;
    }

    public String getProductId() { return productId; }
    public int getQuantity() { return quantity; }
    public String getLocation() { return location; }
    public boolean isAvailable() { return available; }

    @Override
    public String toString() {
        return String.format("Inventory{quantity=%d, location='%s', available=%s}",
            quantity, location, available);
    }
}
