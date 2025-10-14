package Enterprise.UnitOfWork;

/**
 * Helper class for inventory management.
 */
public class InventoryManager {
    /**
     * Reserves inventory for a product.
     *
     * @param product The product
     * @param quantity The quantity to reserve
     * @return true if reservation successful
     */
    public boolean reserveInventory(Product product, int quantity) {
        return product.getStockQuantity() >= quantity;
    }
}
