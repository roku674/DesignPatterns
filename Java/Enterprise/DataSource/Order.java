package Enterprise.DataSource;

/**
 * Domain object for Order - kept clean of persistence logic
 * Used with Data Mapper pattern
 */
public class Order {
    private Long id;
    private String customerName;
    private double totalAmount;
    private String status;

    public Order(String customerName, double totalAmount, String status) {
        this.customerName = customerName;
        this.totalAmount = totalAmount;
        this.status = status;
    }

    public Order(Long id, String customerName, double totalAmount, String status) {
        this.id = id;
        this.customerName = customerName;
        this.totalAmount = totalAmount;
        this.status = status;
    }

    // Business logic
    public void ship() {
        if (!"PENDING".equals(status)) {
            throw new IllegalStateException("Order cannot be shipped from status: " + status);
        }
        this.status = "SHIPPED";
    }

    public void cancel() {
        if ("DELIVERED".equals(status)) {
            throw new IllegalStateException("Cannot cancel delivered order");
        }
        this.status = "CANCELLED";
    }

    public boolean isPending() {
        return "PENDING".equals(status);
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "Order{id=" + id + ", customer='" + customerName + "', amount=" + totalAmount +
               ", status='" + status + "'}";
    }
}
