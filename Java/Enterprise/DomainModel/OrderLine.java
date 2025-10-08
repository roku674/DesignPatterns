package Enterprise.DomainModel;

import java.math.BigDecimal;

/**
 * Represents a line item in an order.
 */
public class OrderLine {
    private Product product;
    private int quantity;

    public OrderLine(Product product, int quantity) {
        if (product == null || quantity <= 0) {
            throw new IllegalArgumentException("Invalid order line parameters");
        }
        this.product = product;
        this.quantity = quantity;
    }

    /**
     * Business logic: Calculate line total.
     */
    public BigDecimal getTotal() {
        return product.getPrice().multiply(new BigDecimal(quantity));
    }

    public Product getProduct() { return product; }
    public int getQuantity() { return quantity; }

    @Override
    public String toString() {
        return String.format("%s x %d = %.2f", product.getName(), quantity, getTotal());
    }
}
